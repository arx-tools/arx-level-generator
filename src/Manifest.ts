import fs from 'node:fs/promises'
import path from 'node:path'
import { type Expand } from 'arx-convert/utils'
import { type MetaData, generateMetadata } from '@src/MetaData.js'
import { type ISettings } from '@platform/common/ISettings.js'
import { fileExists } from '@platform/node/helpers.js'

export type ManifestData = Expand<
  MetaData & {
    files: string[]
  }
>

export class Manifest {
  static filename: string = 'manifest.json'

  static getPathToFilename(settings: ISettings): string {
    return path.resolve(settings.outputDir, Manifest.filename)
  }

  static async exists(settings: ISettings): Promise<boolean> {
    const filename = Manifest.getPathToFilename(settings)
    return fileExists(filename)
  }

  static async read(settings: ISettings): Promise<ManifestData | undefined> {
    const filename = Manifest.getPathToFilename(settings)

    if ((await Manifest.exists(settings)) === false) {
      return undefined
    }

    try {
      const rawIn = await fs.readFile(filename, { encoding: 'utf8' })
      return JSON.parse(rawIn) as ManifestData
    } catch {
      console.error(`[error] Manifest: failed to read or parse "${Manifest.filename}" in "${settings.outputDir}"`)
      return undefined
    }
  }

  static async write(settings: ISettings, files: string[], prettify: boolean = false): Promise<void> {
    const metaData = await generateMetadata(settings)

    const manifest: ManifestData = {
      ...metaData,
      files: files.map((file) => {
        return file.replace(settings.outputDir, '')
      }),
    }

    let stringifiedData: string
    if (prettify) {
      stringifiedData = JSON.stringify(manifest, null, 2)
    } else {
      stringifiedData = JSON.stringify(manifest)
    }

    await fs.writeFile(Manifest.getPathToFilename(settings), stringifiedData, { encoding: 'utf8' })
  }

  static async uninstall(settings: ISettings): Promise<void> {
    if ((await Manifest.exists(settings)) === false) {
      return
    }

    const manifest = (await Manifest.read(settings)) ?? { files: [] }

    for (const file of manifest.files) {
      try {
        await fs.rm(path.resolve(settings.outputDir, file))
      } catch {}
    }

    try {
      await fs.rm(Manifest.getPathToFilename(settings))
    } catch {}
  }
}
