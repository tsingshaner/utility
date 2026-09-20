import { defineConfig } from 'tsdown'

export default defineConfig([
  {
    cwd: 'packages/utility',
    dts: {
      oxc: true
    },
    entry: {
      client: './src/client.ts',
      index: './src/index.ts',
      server: './src/server.ts'
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
  },
  {
    cwd: 'packages/hono',
    dts: {
      tsgo: true
    },
    entry: {
      index: './src/index.ts',
      middlewares: './src/middlewares/index.ts'
    },
    name: '@qingshaner/utility-hono',
    target: 'es2024'
  },
  {
    cwd: 'packages/orpc',
    dts: {
      oxc: true
    },
    entry: {
      context: './src/context/index.ts',
      index: './src/index.ts',
      timing: './src/timing/index.ts'
    },
    name: '@qingshaner/utility-orpc',
    target: 'es2024'
  }
])
