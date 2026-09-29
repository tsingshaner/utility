import { glob, readFile, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'

import { COMMON_ERROR_STATUS_MAP } from '@orpc/server'
import { createUnplugin, type FilterPattern, type UnpluginFactory } from 'unplugin'

interface Options {
  sourceDirs?: string[]
  outputFile?: string
  include?: FilterPattern
}

const ERROR_CODE_RE = /(['"`])([A-Z][A-Z0-9_]*::[A-Z][A-Z0-9_]*)\1/g

const ERROR_CODE_FILTER_RE = /(['"`])([A-Z][A-Z0-9_]*::[A-Z][A-Z0-9_]*)\1/

const normalizeId = (id: string): string => resolve(id.split('?')[0])

const getStatusCode = (errorCode: string): number => {
  const prefix = errorCode.split('::')[0]

  if (!(prefix in COMMON_ERROR_STATUS_MAP)) {
    throw new Error(`[error-code-map] Unknown error code prefix "${prefix}" in "${errorCode}"`)
  }

  return COMMON_ERROR_STATUS_MAP[prefix as keyof typeof COMMON_ERROR_STATUS_MAP]
}

const unpluginFactory: UnpluginFactory<Options | undefined> = (options?: Options) => {
  const sourceDirs = options?.sourceDirs ?? ['./src']

  const outputFile = resolve(options?.outputFile ?? './src/error-code-map.gen.ts')

  const moduleCodes = new Map<string, Set<string>>()

  let lastContent = ''

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

    const sortedCodes = [...errorCodes].sort()

    const content = `// This file is auto-generated. Do not edit.
import { COMMON_ERROR_STATUS_MAP } from '@orpc/openapi'

export type ErrorCode = ${sortedCodes.length > 0 ? sortedCodes.map((code) => `'${code}'`).join(' | ') : 'never'}

export const ErrorStatusMap = {
  ...COMMON_ERROR_STATUS_MAP,
${sortedCodes.map((code) => `  '${code}': ${getStatusCode(code)},`).join('\n')}
} as const
`

    if (content === lastContent) {
      return
    }

    try {
      if ((await readFile(outputFile, 'utf8')) === content) {
        lastContent = content
        return
      }
    } catch {
      // generated file does not exist yet
    }

    lastContent = content

    await writeFile(outputFile, content, 'utf8')
  }

  const scanAll = async (): Promise<void> => {
    moduleCodes.clear()

    for (const cwd of sourceDirs) {
      for await (const file of glob('**/*.ts', {
        cwd,
        exclude: ['**/*.gen.ts']
      })) {
        const id = normalizeId(join(cwd, file))
        const source = await readFile(id, 'utf8')

        moduleCodes.set(id, collect(source))
      }
    }

    await generate()
  }

  return {
    async buildStart(): Promise<void> {
      await scanAll()
    },
    name: 'error-code-map',

    transform: {
      filter: {
        code: ERROR_CODE_FILTER_RE,
        id: {
          exclude: [/node_modules/, /dist/, /error-code-map\.gen\.ts$/],
          include: options?.include ?? /\.ts$/
        }
      },

      async handler(code: string, id: string): Promise<void> {
        moduleCodes.set(normalizeId(id), collect(code))

        await generate()
      }
    },

    async watchChange(id: string, change: { event: 'create' | 'update' | 'delete' }): Promise<void> {
      const normalizedId = normalizeId(id)

      if (change.event === 'delete') {
        moduleCodes.delete(normalizedId)
        await generate()
        return
      }

      try {
        const source = await readFile(normalizedId, 'utf8')

        moduleCodes.set(normalizedId, collect(source))
      } catch {
        moduleCodes.delete(normalizedId)
      }

      await generate()
    }
  }
}

export default createUnplugin(unpluginFactory).rolldown as ReturnType<
  typeof createUnplugin<Options | undefined, boolean>
>['rolldown']
