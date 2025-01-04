import { resolve } from 'node:path'

import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

import pkgJSON from './package.json' with { type: 'json' }

const root = import.meta.dirname

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: resolve(root, 'src/index.ts')
      },
      formats: ['es', 'cjs']
    },
    minify: false,
    rollupOptions: {
      external: [...Object.keys(pkgJSON.dependencies), /^klona\//, /^node:/]
    }
  },
  plugins: [
    dts({
      copyDtsFiles: true,
      include: ['src/**/*', 'src/**/*.d.ts'],
      rollupConfig: {
        apiReport: {
          enabled: false,
          reportFolder: resolve(root, 'report'),
          reportTempFolder: resolve(root, '.temp')
        },
        docModel: {
          apiJsonFilePath: resolve(root, 'report/tsdoc.api.json'),
          enabled: false
        }
      },
      rollupOptions: {
        localBuild: true,
        typescriptCompilerFolder: resolve(root, '../../node_modules/typescript')
      },
      rollupTypes: true,
      tsconfigPath: resolve(root, '../../config/tsconfig.build.json')
    })
  ],
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, 'src')
    }
  },
  root
})
