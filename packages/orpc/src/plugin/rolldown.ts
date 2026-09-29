import { glob, readFile, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'

import { createUnplugin, type FilterPattern, type UnpluginFactory } from 'unplugin'

interface Options {
  sourceDirs?: string[]
  outputFile?: string
  include?: FilterPattern
}

const ERROR_CODE_RE = /(['"`])([A-Z][A-Z0-9_]*::[A-Z][A-Z0-9_]*)\1/g

const unpluginFactory: UnpluginFactory<Options | undefined> = (options?: Options) => {
  const sourceDirs = options?.sourceDirs ?? ['./src']
  const outputFile = resolve(options?.outputFile ?? './src/error-code-map.gen.ts')

  const moduleCodes = new Map<string, Set<string>>()

  const collect = (source: string): Set<string> => {
    const codes = new Set<string>()

    for (const match of source.matchAll(ERROR_CODE_RE)) {
      if (match[2]) {
        codes.add(match[2])
      }
    }

    return codes
  }

  const generate = async (): Promise<void> => {
    const errorCodes = new Set<string>()

    for (const codes of moduleCodes.values()) {
      for (const code of codes) {
        errorCodes.add(code)
      }
    }

    const codes = [...errorCodes].sort()

    await writeFile(
      outputFile,
      `// This file is auto-generated. Do not edit.

export const errorCodes = ${JSON.stringify(codes, null, 2)} as const

export type ErrorCode = (typeof errorCodes)[number]

export const errorCodeSet: ReadonlySet<ErrorCode> =
  new Set(errorCodes)

export const isErrorCode = (value: string): value is ErrorCode =>
  errorCodeSet.has(value as ErrorCode)
`,
      'utf8'
    )
  }

  const scanAll = async (): Promise<void> => {
    moduleCodes.clear()

    for (const cwd of sourceDirs) {
      for await (const file of glob('**/*.ts', {
        cwd,
        exclude: ['**/*.gen.ts']
      })) {
        const id = join(cwd, file)
        const source = await readFile(id, 'utf8')

        moduleCodes.set(id, collect(source))
      }
    }

    await generate()
  }

  return {
    /**
     * 关键：
     *
     * 在 Rollup/Vite/Rolldown 开始加载入口模块之前，
     * 先把 error-code-map.gen.ts 生成出来。
     */
    async buildStart(): Promise<void> {
      await scanAll()
    },
    name: 'error-code-map',

    transform: {
      filter: {
        code: /(['"`])([A-Z][A-Z0-9_]*::[A-Z][A-Z0-9_]*)\1/,
        id: {
          exclude: [/node_modules/, /dist/, /error-code-map\.gen\.ts$/],
          include: options?.include ?? /\.ts$/
        }
      },

      async handler(code: string, id: string): Promise<void> {
        moduleCodes.set(id, collect(code))

        // dev / HMR 时更新生成文件
        await generate()
      }
    },

    async watchChange(
      id: string,
      change: {
        event: 'create' | 'update' | 'delete'
      }
    ): Promise<void> {
      if (change.event === 'delete') {
        moduleCodes.delete(id)
        await generate()
        return
      }

      // 新版本如果已经没有 ERROR::CODE，
      // code filter 不会进入 transform，因此这里重新读取最可靠。
      try {
        const source = await readFile(id, 'utf8')
        moduleCodes.set(id, collect(source))
      } catch {
        moduleCodes.delete(id)
      }

      await generate()
    }
  }
}

export default createUnplugin(unpluginFactory).rolldown as ReturnType<
  typeof createUnplugin<Options | undefined, boolean>
>['rolldown']
