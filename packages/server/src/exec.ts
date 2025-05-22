import { exec } from 'node:child_process'
import { promisify } from 'node:util'

import { IS_WIN } from './cross-platform'

/**
 * Promisified version of {@link exec | node:child_process.exec}.
 *
 * @public
 */
export const promisifyExec: typeof exec.__promisify__ = promisify(exec)

/**
 * Escapes a shell command.
 *
 * @param command - The command to escape.
 *
 * @public
 */
export const escapeShell = (command: string): string => {
  if (IS_WIN) {
    return `"${command}"`
  }

  return command.replace(/([&#;`|*?~<>^()[]{}\$\])/g, '\\$1').replace(/([%!])/g, '^$1')
}

// const metaCharsRegExp = /([()\][%!^"`<>&|;, *?])/g

// /**
//  *
//  * @param arg -
//  *
//  * @public
//  */
// export const escapeShellArg = (arg: string): string => {
//   const escaped = `'${arg.replace(/'/g, "'\\''")}'`
//   // See http://www.robvanderwoude.com/escapechars.php

//   // // Escape meta chars
//   // arg = arg.replace(metaCharsRegExp, '^$1')

//   // return arg

//   if (!IS_WIN) {
//     return escaped
//   }

//   return escaped.replace(/"/g, '\\"')
// }

// export const isShebang = (line: string): boolean => line.startsWith('#!')

// export interface Shebang {
//   args: string[]
//   isEnv: boolean
//   program: string
// }

// export const readShebangCommand = (line: string): Shebang | undefined => {
//   if (!isShebang(line)) {
//     return
//   }

//   const [path, ...argument] = line.slice(2).trimStart().split(' ')
//   const binary = path.split('/').pop()

//   if (binary === 'env') {
//     if (argument[0] === '-S') {
//       return {
//         args: argument,
//         isEnv: true,
//         program: ''
//       }
//     }

//     return argument as Command
//   }

//   return
// }
