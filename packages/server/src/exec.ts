import { exec, execFile } from 'node:child_process'
import { promisify } from 'node:util'

/**
 * Promisified version of {@link exec | node:child_process.exec}.
 *
 * @public
 */
export const promisifyExec: typeof exec.__promisify__ = promisify(exec)

/**
 * Promisified version of {@link execFile | node:child_process.execFile}.
 *
 * @public
 */
export const promisifyExecFile: typeof execFile.__promisify__ = promisify(execFile)
