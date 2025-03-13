interface IGetEnvPathKey {
  (): string
  /** @internal */
  pathKey?: string
}

/**
 * Returns the key for the PATH environment variable.
 *
 * @remarks
 * On Windows, this is usually 'Path', but it is not guaranteed.
 * On other platforms, it is 'PATH'.
 *
 * @see {@link https://github.com/zkochan/path-name | path-name}
 *
 * @public
 */
export const getEnvPathKey = (() => {
  if (getEnvPathKey.pathKey !== undefined) {
    return getEnvPathKey.pathKey
  }

  if (process.platform === 'win32') {
    getEnvPathKey.pathKey = 'Path'
    for (const key in process.env) {
      if (key.toLowerCase() === 'path') {
        getEnvPathKey.pathKey = key
        break
      }
    }
  } else {
    getEnvPathKey.pathKey = 'PATH'
  }

  return getEnvPathKey.pathKey
}) as IGetEnvPathKey
