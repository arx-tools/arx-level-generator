import fs from 'node:fs/promises'
import path from 'node:path'
import { type Expand } from 'arx-convert/utils'
import { type MetaData, generateMetadata } from '@platform/node/MetaData.js'
import { fileExists } from '@platform/node/helpers.js'
import { type IManifest } from '@platform/common/IManifest.js'
import { type ISettings } from '@platform/common/ISettings.js'

export type ManifestData = Expand<
  MetaData & {
    files: string[]
  }
>

export class Manifest implements IManifest {
  static readonly filename: string = 'manifest.json'

  readonly settings: ISettings

  constructor(settings: ISettings) {
    this.settings = settings
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

  getPathToFilename(): string {
    return path.resolve(this.settings.outputDir, Manifest.filename)
  }

  async exists(): Promise<boolean> {
    const filename = this.getPathToFilename()
    return fileExists(filename)
  }

  async read(): Promise<ManifestData | undefined> {
    const filename = this.getPathToFilename()

    if ((await this.exists()) === false) {
      return undefined
    }

    try {
      const rawIn = await fs.readFile(filename, { encoding: 'utf8' })
      return JSON.parse(rawIn) as ManifestData
    } catch {
      console.error(`[error] Manifest: failed to read or parse "${Manifest.filename}" in "${this.settings.outputDir}"`)
      return undefined
    }
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
}
