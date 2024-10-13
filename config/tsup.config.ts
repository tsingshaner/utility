import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { defineConfig } from 'tsup'

const currentPath = fileURLToPath(new URL('.', import.meta.url))
const sourceDir = resolve(currentPath, '../src')

export default defineConfig({
  bundle: true,
  clean: true,
  dts: true,
  entry: {
    index: resolve(sourceDir, 'index.ts')
  },
  format: ['cjs', 'esm'],
  outDir: 'dist',
  target: 'esnext',
  tsconfig: resolve(currentPath, 'tsconfig.app.json')
})
