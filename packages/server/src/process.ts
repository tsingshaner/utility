import { loadEnvFile } from 'node:process'

import type { PathLike } from 'node:fs'

export const loadEnvFiles = (files: PathLike[]): void => {
  for (const file of files) {
    try {
      loadEnvFile(file)
    } catch (_e) {}
  }
}
