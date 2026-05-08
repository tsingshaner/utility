import { defineConfig } from 'tsdown'

export default defineConfig([
  {
    cwd: 'packages/utility',
    dts: {
      oxc: true
    },
    name: '@qingshaner/utility',
    target: 'es2023'
  },
  {
    cwd: 'packages/server',
    dts: {
      oxc: true
    },
    name: '@qingshaner/utility-server',
    target: 'es2023'
  },
  {
    cwd: 'packages/shared',
    dts: {
      oxc: true
    },
    name: '@qingshaner/utility-shared',
    target: 'es2023'
  },
  {
    cwd: 'packages/client',
    dts: {
      oxc: true
    },
    name: '@qingshaner/utility-client',
    target: 'es2023'
  }
])
