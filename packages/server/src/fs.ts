import { type PathLike, statSync } from 'node:fs'
import { mkdir, rm, stat } from 'node:fs/promises'

import { asyncSafety, type Result, syncSafety } from '@qingshaner/utility-shared'

/**
 * The error code of the `NodeJS.ErrnoException`.
 *
 * @public
 */
export enum ErrnoExceptionCode {
  /** No such file or directory */
  Enoent = 'ENOENT'
}

/**
 * The `NodeJS.ErrnoException` type with type infer for code.
 * @public
 */
export type NodeJSErrnoException = {
  /** @see {@link ErrnoExceptionCode} */
  code?: 'ENOENT' | ({} & string)
} & Omit<NodeJS.ErrnoException, 'code'>

/**
 * Check if the path is a directory.
 * @param path - The path to check.
 * @returns
 * A promise that resolves to `true` if the path is a directory, `false` otherwise.
 * {@link https://nodejs.org/docs/latest/api/errors.html#common-system-errors | NodeJS.ErrnoException} maybe catch.
 *
 * @public
 */
export const isDirectory = async (path: PathLike): Promise<Result<boolean, NodeJSErrnoException>> => {
  const res = await safeStat(path)
  if (!res[1]) {
    return res
  }

  return [res[0].isDirectory(), true]
}

/**
 * Clear a possible directory, if it doesn't exist, an empty directory will be created.
 * @param path - The path to clean.
 * @throws
 * {@link https://nodejs.org/docs/latest/api/errors.html#common-system-errors | NodeJS.ErrnoException} maybe throw.
 * The error with code `ENOENT` is handled (create an empty directory), other errors will be thrown.
 *
 * @public
 */
export const cleanDir = async (path: PathLike): Promise<Result<unknown, NodeJSErrnoException>> => {
  const [isOrErr, success] = await isDirectory(path)

  if (success) {
    if (isOrErr) {
      await rm(path, {
        force: true,
        recursive: true
      })
    }
  } else if (isOrErr.code !== ErrnoExceptionCode.Enoent) {
    throw isOrErr
  }

  return safeMkdir(path, { recursive: true })
}

/** Handle the error of the `fs.stat` function. */
export const safeStat = asyncSafety<typeof stat, NodeJSErrnoException>(stat)
/** Handle the error of the `fs.statSync`. */
export const safeSyncStat = syncSafety<typeof statSync, NodeJSErrnoException>(statSync)
/** Handle the error of the `fs.mkdir`. */
export const safeMkdir = asyncSafety<typeof mkdir, NodeJSErrnoException>(mkdir)
