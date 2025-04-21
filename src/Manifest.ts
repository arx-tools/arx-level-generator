import fs from 'node:fs/promises'
import path from 'node:path'
import type { Simplify } from 'type-fest'
import { type MetaData, generateMetadata } from '@src/MetaData.js'
import type { Settings } from '@src/Settings.js'
import { fileOrFolderExists, readTextFile } from '@src/platform/node/io.js'

export type ManifestData = Simplify<
  MetaData & {
    files: string[]
  }
>

export class Manifest {
  static filename: string = 'manifest.json'

  settings: Settings

  constructor(settings: Settings) {
    this.settings = settings
  }

  async uninstall(): Promise<void> {
    const manifest = (await this.read()) ?? { files: [] }

    for (const file of manifest.files) {
      try {
        await fs.rm(path.resolve(this.settings.outputDir, file))
      } catch {}
    }

    try {
      await fs.rm(this.getPathToFilename())
    } catch {}
  }

  async generate(files: string[], prettify: boolean = false): Promise<ArrayBufferLike> {
    const metaData = await generateMetadata(this.settings)

    const manifest: ManifestData = {
      ...metaData,
      files: files.map((file) => {
        return file.replace(this.settings.outputDir, '')
      }),
    }

    let stringifiedData: string
    if (prettify) {
      stringifiedData = JSON.stringify(manifest, null, '\t')
    } else {
      stringifiedData = JSON.stringify(manifest)
    }

    const encoder = new TextEncoder()
    const view = encoder.encode(stringifiedData)

    return view.buffer
  }

  private getPathToFilename(): string {
    return path.resolve(this.settings.outputDir, Manifest.filename)
  }

  private async exists(): Promise<boolean> {
    const filename = this.getPathToFilename()
    return fileOrFolderExists(filename)
  }

  private async read(): Promise<ManifestData | undefined> {
    const filename = this.getPathToFilename()

    if ((await this.exists()) === false) {
      return undefined
    }

    try {
      const rawIn = await readTextFile(filename)
      return JSON.parse(rawIn) as ManifestData
    } catch {
      console.error(`[error] Manifest: failed to read or parse "${Manifest.filename}" in "${this.settings.outputDir}"`)
      return undefined
    }
  }
}
