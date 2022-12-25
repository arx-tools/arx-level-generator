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
    const rawIn = await fs.promises.readFile(`${dir}/arx-level-generator-manifest.json`, 'utf-8')
    const manifest = JSON.parse(rawIn) as Manifest
    for (let file of manifest.files) {
      try {
        await fs.promises.rm(file)
      } catch (f) {}
    }
    await fs.promises.rm(`${dir}/arx-level-generator-manifest.json`)
  } catch (e) {}
}

export const randomBetween = (min: number, max: number) => {
  return Math.random() * (max - min) + min
}
