import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export async function fileExists(filename: string): Promise<boolean> {
  try {
    await fs.access(filename, fs.constants.R_OK | fs.constants.W_OK)
    return true
  } catch {
    return false
  }
}

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
      const rawIn = await fs.readFile(path.resolve(dirname, '../package.json'), { encoding: 'utf8' })
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
      const rawIn = await fs.readFile(path.resolve('./package.json'), { encoding: 'utf8' })
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
