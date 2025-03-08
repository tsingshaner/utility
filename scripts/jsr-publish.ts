import { exec } from 'node:child_process'
import { glob, readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

import type { PathLike } from 'node:fs'

interface Package {
  [key: string]: unknown
  name: string
  version: string
}
export const getPackage = async (path: PathLike): Promise<Package> =>
  JSON.parse(await readFile(path, { encoding: 'utf-8' })) as Promise<Package>
const execPublish = (dir: PathLike): void => {
  exec('pnpm dlx jsr publish', { cwd: dir.toString(), encoding: 'utf-8' }, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing pnpm dlx jsr publish in ${dir.toString()}:`, error)
      return
    }
    console.info(`stdout: ${stdout}`)
    console.error(`stderr: ${stderr}`)
  })
}
type ChangesetReleases = Awaited<ReturnType<typeof getPackage>>[]
const publishJSR = async (releases: ChangesetReleases): Promise<void> => {
  for await (const packageDir of glob('packages/*')) {
    const packageName = (await getPackage(resolve(packageDir, 'package.json'))).name
    if (releases.some(({ name }) => name === packageName)) {
      execPublish(packageDir)
    }
  }
}

void publishJSR(JSON.parse(process.argv[2]) as ChangesetReleases)
