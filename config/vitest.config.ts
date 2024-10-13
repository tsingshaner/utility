import { fileURLToPath } from 'node:url'

import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('../src/', import.meta.url))
    }
  },
  test: {
    coverage: {
      all: true,
      include: ['src/']
    },
    root: fileURLToPath(new URL('../', import.meta.url))
  }
})
