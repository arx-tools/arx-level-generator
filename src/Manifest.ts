import fs from 'node:fs/promises'
import path from 'node:path'
import { MetaData, generateMetadata } from '@src/MetaData.js'
import { Settings } from '@src/Settings.js'
import { fileExists } from '@src/helpers.js'

export type ManifestData = MetaData & {
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

  static async read(settings: Settings): Promise<ManifestData | undefined> {
    const filename = Manifest.getPathToFilename(settings)

    if (!(await Manifest.exists(settings))) {
      return undefined
    }

    try {
      const rawIn = await fs.readFile(filename, 'utf-8')
      return JSON.parse(rawIn)
    } catch (e: unknown) {
      console.error(`[error] Manifest: failed to read or parse "${Manifest.filename}" in "${settings.outputDir}"`)
      return undefined
    }
  }

  static async write(settings: Settings, files: string[], prettify: boolean = false) {
    const metaData = await generateMetadata(settings)

    const manifest: ManifestData = {
      ...metaData,
      files: files.map((file) => {
        return file.replace(settings.outputDir, '')
      }),
    }

    await fs.writeFile(
      Manifest.getPathToFilename(settings),
      prettify ? JSON.stringify(manifest, null, 2) : JSON.stringify(manifest),
    )
  }

  static async uninstall(settings: Settings) {
    if (!(await Manifest.exists(settings))) {
      return
    }

    const manifest = (await Manifest.read(settings)) ?? { files: [] }

    for (const file of manifest.files) {
      try {
        await fs.rm(path.resolve(settings.outputDir, file))
      } catch (e: unknown) {}
    }

    try {
      await fs.rm(Manifest.getPathToFilename(settings))
    } catch (e: unknown) {}
  }
}
