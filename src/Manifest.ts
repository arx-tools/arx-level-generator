import path from 'node:path'
import type { Simplify } from 'type-fest'
import type { SingleArrayBufferExport } from '@src/types.js'
import type { Settings } from '@platform/common/Settings.js'
import { fileOrFolderExists, readTextFile } from '@platform/node/io.js'
import { type MetaData, generateMetadata } from '@platform/node/metadata.js'

export type ManifestData = Simplify<
  MetaData & {
    /**
     * A list of paths relative to the output directory
     */
    files: string[]
  }
>

export class Manifest {
  static readonly filename: string = 'manifest.json'

  settings: Settings

  constructor(settings: Settings) {
    this.settings = settings
  }

  async getFilesFromManifestJSON(): Promise<string[]> {
    const filesToDelete: string[] = []

    const manifest = (await this.read()) ?? { files: [] }
    for (const file of manifest.files) {
      filesToDelete.push(path.resolve(this.settings.outputDir, file))
    }

    filesToDelete.push(this.getPathToFilename())

    return filesToDelete
  }

  async generate(files: string[], prettify: boolean = false): Promise<SingleArrayBufferExport> {
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

    const target = this.getPathToFilename()

    return [view.buffer, target]
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
