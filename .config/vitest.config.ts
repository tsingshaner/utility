import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { configDefaults, defineProject } from 'vitest/config'

export default defineProject({
  test: {
    ...configDefaults,
    alias: [
      {
        find: /@qingshaner\/utility\-([\w-]+)$/,
        replacement: fileURLToPath(new URL('../packages/$1/src', import.meta.url))
      },
      {
        find: '@qingshaner/utility',
        replacement: fileURLToPath(new URL('../packages/utility/src', import.meta.url))
      }
    ],
    include: ['packages/*/src/**/*.{test,spec}.?(c|m)ts?(x)'],
    root: resolve(import.meta.dirname, '..'),
    typecheck: {
      checker: 'tsc',
      enabled: true,
      ignoreSourceErrors: false,
      only: false,
      tsconfig: fileURLToPath(new URL('tsconfig.vitest.json', import.meta.url))
    }
  }
})
