import process from 'node:process'

/**
 * Whether the current platform is Windows.
 *
 * @public
 */
export const IS_WIN = process.platform === 'win32'

const parsePathKey = (opts: Pick<NodeJS.Process, 'env' | 'platform'>): string => {
  if (!IS_WIN) {
    return 'PATH'
  }

  let pathKey = 'Path'
  for (const key in opts.env) {
    if (key.toLowerCase() === 'path') {
      pathKey = key
    }
  }

  return pathKey
}

interface IGetEnvPathKey {
  (): string
  /**
   * A cache key to avoid re-parsing the path key
   *
   * @internal
   * */
  pathKey?: string
}

/**
 * Returns the key for the PATH environment variable.
 * @param opts - The options to use.
 *
 * @remarks
 * On Windows, this is usually 'Path', but it is not guaranteed.
 * On other platforms, it is 'PATH'.
 *
 * @see {@link https://github.com/zkochan/path-name | path-name}
 *
 * @public
 */
export const getEnvPathKey = ((opts?: Partial<Pick<NodeJS.Process, 'env' | 'platform'>>) => {
  if (opts !== undefined) {
    return parsePathKey({
      env: opts.env ?? process.env,
      platform: opts.platform ?? process.platform
    })
  }

  if (getEnvPathKey.pathKey !== undefined) {
    return getEnvPathKey.pathKey
  }

  getEnvPathKey.pathKey = parsePathKey(process)
  return getEnvPathKey.pathKey
}) as IGetEnvPathKey
