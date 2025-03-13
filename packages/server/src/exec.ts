import { exec } from 'node:child_process'
import { promisify } from 'node:util'

/**
 * Promisified version of {@link exec | node:child_process.exec}.
 *
 * @public
 */
export const promisifyExec = promisify(exec)
