import fs from 'node:fs'
import path from 'node:path'
import { ArxMap } from '@src/ArxMap.js'
import { MetaData } from '@src/MetaData.js'
import { Settings } from '@src/Settings.js'
import { fileExists } from './helpers.js'

export type ManifestData = ReturnType<MetaData['toData']> & {
  files: string[]
}

export class Manifest {
  static filename: string = 'manifest.json'

  static getPathToFilename(settings: Settings) {
    return path.resolve(settings.outputDir, Manifest.filename)
  }

  static async exists(settings: Settings) {
    const filename = Manifest.getPathToFilename(settings)
    return await fileExists(filename)
  }

  static async read(settings: Settings): Promise<ManifestData> {
    const filename = Manifest.getPathToFilename(settings)

    const emptyMetadata = new MetaData()
    const emptyManifest = {
      ...emptyMetadata.toData(),
      files: [],
    }

    if (!(await Manifest.exists(settings))) {
      return emptyManifest
    }

    try {
      const rawIn = await fs.promises.readFile(filename, 'utf-8')
      return JSON.parse(rawIn)
    } catch (e: unknown) {
      console.error(`[error] Manifest: failed to read or parse "${Manifest.filename}" in "${settings.outputDir}"`)
      return emptyManifest
    }
  }

  static async write(settings: Settings, map: ArxMap, files: string[], prettify: boolean = false) {
    const manifest: ManifestData = {
      ...map.meta.toData(),
      files: files.map((file) => {
        return file.replace(settings.outputDir, '')
      }),
    }

    await fs.promises.writeFile(
      Manifest.getPathToFilename(settings),
      prettify ? JSON.stringify(manifest, null, 2) : JSON.stringify(manifest),
    )
  }

  static async uninstall(settings: Settings) {
    if (!(await Manifest.exists(settings))) {
      return
    }

    const manifest = await Manifest.read(settings)

    for (let file of manifest.files) {
      try {
        await fs.promises.rm(path.resolve(settings.outputDir, file))
      } catch (e: unknown) {}
    }

    try {
      await fs.promises.rm(Manifest.getPathToFilename(settings))
    } catch (e: unknown) {}
  }
}
