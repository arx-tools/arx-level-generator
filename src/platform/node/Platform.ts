import fs from 'node:fs/promises'
import path from 'node:path'
import type { ArxMap } from '@src/ArxMap.js'
import { ensureArray, uniq } from '@src/faux-ramda.js'
import type { ArrayBufferExports } from '@src/types.js'
import type { IODiff, Platform as IPlatform } from '@platform/common/Platform.js'
import type { Settings } from '@platform/common/Settings.js'
import { readBinaryFile, writeBinaryFile } from '@platform/node/io.js'

export class Platform implements IPlatform {
  private readonly maps: ArxMap[]

  constructor() {
    this.maps = []
  }

  from(map: ArxMap | ArxMap[]): this {
    this.maps.push(...ensureArray(map))
    return this
  }

  async save(settings: Settings, exportJsonFiles: boolean = false, prettify: boolean = false): Promise<void> {
    const files: IODiff = {
      toAdd: {},
      toCopy: {},
      toRemove: [],
    }

    const maps = uniq(this.maps)

    for (const map of maps) {
      const { toAdd, toCopy, toRemove } = await map.export(settings, exportJsonFiles, prettify)
      files.toAdd = { ...files.toAdd, ...toAdd }
      files.toCopy = { ...files.toCopy, ...toCopy }
      files.toRemove = [...files.toRemove, ...toRemove]
    }

    await this.removeFromDisk(files.toRemove)
    await this.copyToDisk(files.toCopy)
    await this.saveToDisk(files.toAdd)
  }

  private async saveToDisk(files: IODiff['toAdd']): Promise<void> {
    for (const target in files) {
      const data = files[target]

      const dirname = path.dirname(target)
      await fs.mkdir(dirname, { recursive: true })

      await writeBinaryFile(target, data)
    }
  }

  private async copyToDisk(files: IODiff['toCopy']): Promise<void> {
    const buffers: ArrayBufferExports = {}

    for (const target in files) {
      const source = files[target]
      buffers[target] = await readBinaryFile(source)
    }

    await this.saveToDisk(buffers)
  }

  private async removeFromDisk(files: IODiff['toRemove']): Promise<void> {
    for (const file of files) {
      try {
        await fs.rm(file)
      } catch {}
    }
  }
}
