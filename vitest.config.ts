import { fileURLToPath } from 'node:url'

import { configDefaults, defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'utility',
          ...configDefaults,
          alias: [
            {
              find: /@qingshaner\/utility\-([\w-]+)$/,
              replacement: fileURLToPath(new URL('packages/$1/src', import.meta.url))
            },
            {
              find: '@qingshaner/utility',
              replacement: fileURLToPath(new URL('packages/utility/src', import.meta.url))
            }
          ],
          include: ['packages/*/src/**/*.{test,spec}.?(c|m)ts?(x)'],
          root: import.meta.dirname,
          typecheck: {
            checker: 'tsc',
            enabled: true,
            ignoreSourceErrors: false,
            only: false,
            tsconfig: fileURLToPath(new URL('.config/tsconfig.vitest.json', import.meta.url))
          }
        }
      }
    ]
  }
})
