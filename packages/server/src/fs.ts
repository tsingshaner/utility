import { type PathLike, type StatOptions, statSync } from 'node:fs'
import { mkdir, rm, stat } from 'node:fs/promises'

import { asyncSafety, syncSafety } from '@qingshaner/utility-shared'

import type { AnyAsyncFunc, AnyFunc, AsyncSafetyFn, Result, SyncSafetyFn } from '@qingshaner/utility-shared'

/**
 * Warp nodejs fs module that maybe catch NodeJSErrnoException.
 *
 * @public
 */
export type SafetyNodeFSFn<T extends AnyFunc> = T extends AnyAsyncFunc
  ? AsyncSafetyFn<T, NodeJSErrnoException>
  : SyncSafetyFn<T, NodeJSErrnoException>
/**
 * Handle the error of the `fs.rm` function.
 *
 * @public
 */
export const safeRm: SafetyNodeFSFn<typeof rm> = asyncSafety(rm)
/**
 * Handle the error of the `fs.stat` function.
 *
 * @public
 */
export const safeStat: SafetyNodeFSFn<typeof stat> = asyncSafety(stat)
/** Handle the error of the `fs.statSync`.
 *
 * @public
 */
export const safeSyncStat: SafetyNodeFSFn<typeof statSync> = syncSafety(statSync)
/** Handle the error of the `fs.mkdir`.
 *
 * @public
 */
export const safeMkdir: SafetyNodeFSFn<typeof mkdir> = asyncSafety(mkdir)
/**
 * The error code of the `NodeJS.ErrnoException`.
 * @see {@link https://nodejs.org/docs/latest/api/errors.html#common-system-errors | NodeJS.ErrnoException}
 *
 * @public
 */
export const ErrnoExceptionCode = {
  /** (Permission denied): An attempt was made to access a file in a way forbidden by its file access permissions. */
  eAcces: 'EACCES',
  /** (Address already in use): An attempt to bind a server (net, http, or https) to a local address failed due to another server on the local system already occupying that address. */
  eAddrInUse: 'EADDRINUSE',
  /** (Connection refused): No connection could be made because the target machine actively refused it. This usually results from trying to connect to a service that is inactive on the foreign host. */
  eConnRefUsed: 'ECONNREFUSED',
  /** (Connection reset by peer): A connection was forcibly closed by a peer. This normally results from a loss of the connection on the remote socket due to a timeout or reboot. Commonly encountered via the http and net modules. */
  eConnReset: 'ECONNRESET',
  /** (File exists): An existing file was the target of an operation that required that the target not exist. */
  eExist: 'EEXIST',
  /** (Is a directory): An operation expected a file, but the given pathname was a directory. */
  eIsDir: 'EISDIR',
  /** (Too many open files in system): Maximum number of file descriptors allowable on the system has been reached, and requests for another descriptor cannot be fulfilled until at least one has been closed. This is encountered when opening many files at once in parallel, especially on systems (in particular, macOS) where there is a low file descriptor limit for processes. To remedy a low limit, run ulimit -n 2048 in the same shell that will run the Node.js process. */
  eMfile: 'EMFILE',
  /** (No such file or directory): Commonly raised by fs operations to indicate that a component of the specified pathname does not exist. No entity (file or directory) could be found by the given path. */
  eNoEnt: 'ENOENT',
  /** (Not a directory): A component of the given pathname existed, but was not a directory as expected. Commonly raised by fs.readdir. */
  eNotDir: 'ENOTDIR',
  /** (Directory not empty): A directory with entries was the target of an operation that requires an empty directory, usually fs.unlink. */
  eNotEmpty: 'ENOTEMPTY',
  /** (DNS lookup failed): Indicates a DNS failure of either EAI_NODATA or EAI_NONAME. This is not a standard POSIX error. */
  eNotFound: 'ENOTFOUND',
  /** (Operation not permitted): An attempt was made to perform an operation that requires elevated privileges. */
  ePerm: 'EPERM',
  /** (Broken pipe): A write on a pipe, socket, or FIFO for which there is no process to read the data. Commonly encountered at the net and http layers, indicative that the remote side of the stream being written to has been closed. */
  ePipe: 'EPIPE',
  /** (Operation timed out): A connect or send request failed because the connected party did not properly respond after a period of time. Usually encountered by http or net. Often a sign that a socket.end() was not properly called. */
  eTimedout: 'ETIMEDOUT'
}
/**
 * The `NodeJS.ErrnoException` type with type infer for code.
 *
 * @public
 */
export type NodeJSErrnoException = {
  /** @see {@link ErrnoExceptionCode} */
  code?: ({} & string) | Uppercase<keyof typeof ErrnoExceptionCode>
} & Omit<NodeJS.ErrnoException, 'code'>

/**
 * Check if the path is a directory.
 * @param path - The path to check.
 *
 * @returns
 * A promise that resolves to `true` if the path is a directory, `false` otherwise.
 * {@link https://nodejs.org/docs/latest/api/errors.html#common-system-errors | NodeJS.ErrnoException} may be caught
 *
 * @public
 */
export const isDirectory = async (
  path: PathLike,
  opts?: StatOptions
): Promise<Result<boolean, NodeJSErrnoException>> => {
  const res = await safeStat(path, opts)
  if (!res[1]) {
    return res
  }

  return [res[0].isDirectory(), true]
}

/**
 * Clear a possible directory, if it doesn't exist, an empty directory will be created.
 * @param path - The path to clean.
 *
 * @returns
 * The error with code `ENOENT` is handled (create an empty directory), other errors will be thrown.
 * {@link https://nodejs.org/docs/latest/api/errors.html#common-system-errors | NodeJS.ErrnoException}  may be caught.
 *
 * @public
 */
export const cleanDir = async (path: PathLike): Promise<Result<unknown, NodeJSErrnoException>> => {
  const [isOrErr, success] = await isDirectory(path)

  if (success) {
    if (isOrErr) {
      const res = await safeRm(path, { force: true, recursive: true })
      if (!res[1]) {
        return res
      }
    }
  } else if (isOrErr.code !== ErrnoExceptionCode.eNoEnt) {
    return [isOrErr, false]
  }

  return safeMkdir(path, { recursive: true })
}

/**
 * Ensure the directory exists, if not, create it recursive.
 * @param path - The path to ensure.
 *
 * @returns
 * A promise that resolves to the path if the directory exists or created successfully, `undefined` otherwise.
 * {@link https://nodejs.org/docs/latest/api/errors.html#common-system-errors | NodeJS.ErrnoException}  may be caught.
 *
 * @public
 */
export const ensureDir = async (path: PathLike): Promise<Result<PathLike | undefined, NodeJSErrnoException>> => {
  const res = await isDirectory(path)

  if (!res[1] && res[0].code !== ErrnoExceptionCode.eNoEnt) {
    return res
  }

  return res[1] && res[0] ? [path, true] : safeMkdir(path, { recursive: true })
}
