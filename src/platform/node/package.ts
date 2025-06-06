import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { readTextFile } from '@platform/node/io.js'

type PackageJsonProps = {
  name: string
  version: string
  description: string
  author: string
  homepage: string
}

export async function getGeneratorPackageJSON(): Promise<PackageJsonProps> {
  try {
    const filename = fileURLToPath(import.meta.url)
    const dirname = path.dirname(filename)
    const rawIn = await readTextFile(path.resolve(dirname, '../../../package.json'))
    return JSON.parse(rawIn) as PackageJsonProps
  } catch {
    return {
      name: '',
      version: '',
      description: '',
      author: '',
      homepage: '',
    }
  }
}

export async function getProjectPackageJSON(): Promise<PackageJsonProps> {
  try {
    const rawIn = await readTextFile(path.resolve('./package.json'))
    return JSON.parse(rawIn) as PackageJsonProps
  } catch {
    return {
      name: '',
      version: '',
      description: '',
      author: '',
      homepage: '',
    }
  }
}
