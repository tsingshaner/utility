import { mkdtemp, readFile, rm, stat, utimes, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { afterEach, describe, expect, test } from 'vitest'

import errorCodeMap from './rolldown'

const directories: string[] = []

const setup = async (outputName = 'error-code-map.gen.ts') => {
  const directory = await mkdtemp(join(tmpdir(), 'error-code-map-'))
  directories.push(directory)
  const sourceFile = join(directory, 'source.ts')
  const outputFile = join(directory, outputName)
  const plugin = errorCodeMap({ outputFile, sourceDirs: [directory] })
  if (Array.isArray(plugin)) {
    throw new Error('Expected a single plugin')
  }

  const run = async (name: 'buildStart' | 'transform' | 'watchChange', ...args: unknown[]) => {
    const hook = plugin[name]
    const handler = typeof hook === 'object' ? hook.handler : hook
    if (typeof handler !== 'function') {
      throw new Error(`Missing ${name} hook`)
    }
    await Reflect.apply(handler, {}, args)
  }

  await writeFile(sourceFile, "export const code = 'BAD_REQUEST::OLD'\n")
  await run('buildStart')
  return { outputFile, run, sourceFile }
}

afterEach(async () => {
  await Promise.all(directories.splice(0).map((directory) => rm(directory, { force: true, recursive: true })))
})

describe('error-code-map', () => {
  test.each(['error-code-map.gen.ts', 'errors.ts'])('does not retain removed codes from %s', async (outputName) => {
    const { outputFile, run, sourceFile } = await setup(outputName)
    await run('watchChange', outputFile, { event: 'update' })

    await writeFile(sourceFile, 'export const code = null\n')
    await run('watchChange', sourceFile, { event: 'update' })
    expect(await readFile(outputFile, 'utf8')).toContain('export type ErrorCode = never')
    await run('buildStart')

    expect(await readFile(outputFile, 'utf8')).toContain('export type ErrorCode = never')
  })

  test('ignores generated output passed to transform', async () => {
    const { outputFile, run, sourceFile } = await setup('errors.ts')
    await run('transform', await readFile(outputFile, 'utf8'), `${outputFile}?v=1`)

    await rm(sourceFile)
    await run('watchChange', sourceFile, { event: 'delete' })

    expect(await readFile(outputFile, 'utf8')).toContain('export type ErrorCode = never')
  })

  test('does not rewrite unchanged output when rebuild and transform overlap', async () => {
    const { outputFile, run, sourceFile } = await setup()
    await writeFile(join(outputFile, '..', 'other.ts'), "export const code = 'NOT_FOUND::OTHER'\n")
    await run('buildStart')
    const timestamp = new Date('2000-01-01T00:00:00Z')
    await utimes(outputFile, timestamp, timestamp)

    await Promise.all([
      run('buildStart'),
      run('transform', "export const code = 'BAD_REQUEST::OLD'", sourceFile),
      run('watchChange', outputFile, { event: 'update' })
    ])

    expect((await stat(outputFile)).mtimeMs).toBe(timestamp.getTime())
  })

  test('processes the next save after generation fails', async () => {
    const { outputFile, run, sourceFile } = await setup()
    await writeFile(sourceFile, "export const code = 'UNKNOWN::CODE'\n")
    await expect(run('watchChange', sourceFile, { event: 'update' })).rejects.toThrow('Unknown error code prefix')

    await writeFile(sourceFile, "export const code = 'NOT_FOUND::NEW'\n")
    await run('watchChange', sourceFile, { event: 'update' })

    const content = await readFile(outputFile, 'utf8')
    expect(content).toContain("export type ErrorCode = 'NOT_FOUND::NEW'")
    expect(content).not.toContain('BAD_REQUEST::OLD')
  })
})
