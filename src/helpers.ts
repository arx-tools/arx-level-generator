import fs from 'node:fs'
import path from 'node:path'

export const getPackageVersion = async () => {
  try {
    const rawIn = await fs.promises.readFile(path.resolve(__dirname, '../package.json'), 'utf-8')
    const { version } = JSON.parse(rawIn) as { version: string }
    return version
  } catch (error) {
    return 'unknown'
  }
}

export type Manifest = {
  files: string[]
}

export const uninstall = async (dir: string) => {
  try {
    const rawIn = await fs.promises.readFile(`${dir}/manifest.json`, 'utf-8')
    const manifest = JSON.parse(rawIn) as Manifest
    for (let file of manifest.files) {
      try {
        await fs.promises.rm(file)
      } catch (f) {}
    }
    await fs.promises.rm(`${dir}/manifest.json`)
  } catch (e) {}
}
