import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { readTextFile } from '@src/platform/node/io.js'

type PackageJsonProps = {
  name: string
  version: string
  description: string
  author: string
  homepage: string
}

let cacheOfGeneratorPackageJSON: PackageJsonProps
let cacheOfProjectPackageJSON: PackageJsonProps

export async function getGeneratorPackageJSON(): Promise<PackageJsonProps> {
  if (cacheOfGeneratorPackageJSON === undefined) {
    try {
      const filename = fileURLToPath(import.meta.url)
      const dirname = path.dirname(filename)
      const rawIn = await readTextFile(path.resolve(dirname, '../package.json'))
      cacheOfGeneratorPackageJSON = JSON.parse(rawIn) as PackageJsonProps
    } catch {
      cacheOfGeneratorPackageJSON = {
        name: '',
        version: '',
        description: '',
        author: '',
        homepage: '',
      }
    }
  }

  return cacheOfGeneratorPackageJSON
}

export async function getProjectPackageJSON(): Promise<PackageJsonProps> {
  if (cacheOfProjectPackageJSON === undefined) {
    try {
      const rawIn = await readTextFile(path.resolve('./package.json'))
      cacheOfProjectPackageJSON = JSON.parse(rawIn) as PackageJsonProps
    } catch {
      cacheOfProjectPackageJSON = {
        name: '',
        version: '',
        description: '',
        author: '',
        homepage: '',
      }
    }
  }

  return cacheOfProjectPackageJSON
}
