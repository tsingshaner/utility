import { glob, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

import type { PathLike } from 'node:fs'

interface Package {
  [key: string]: unknown
  name: string
  version: string
}

const getPackage = async (path: PathLike): Promise<Package> =>
  JSON.parse(await readFile(path, { encoding: 'utf-8' })) as Promise<Package>
const updateVersion = async (path: PathLike, version: string): Promise<void> => {
  const jsrContent = (await readFile(path, { encoding: 'utf-8' })).replace(/"version": ".*"/, `"version": "${version}"`)
  await writeFile(path, jsrContent)
}

const updateJSRPackages = async (pkgDirIterator: NodeJS.AsyncIterator<string>): Promise<void> => {
  for await (const packageDir of pkgDirIterator) {
    const [npmFile, jsrFile] = ['package.json', 'jsr.json'].map((f) => resolve(packageDir, f))
    const [npmPackage, jsrPackage] = await Promise.all([npmFile, jsrFile].map(getPackage))
    if (jsrPackage.version !== npmPackage.version) {
      await updateVersion(jsrFile, npmPackage.version)
      console.info(`Update jsr package '${jsrPackage.name}' ${jsrPackage.version} -> ${npmPackage.version}`)
    }
  }
}

void updateJSRPackages(glob('packages/*'))
