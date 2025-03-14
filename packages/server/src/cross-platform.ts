import process from 'node:process'

interface IGetEnvPathKey {
  (): string
  /** @internal */
  pathKey?: string
}

const parsePathKey = (opts: Pick<NodeJS.Process, 'env' | 'platform'>): string => {
  if (opts.platform !== 'win32') {
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
