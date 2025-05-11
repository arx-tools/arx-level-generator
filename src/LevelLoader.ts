import path from 'node:path'
import { DLF, FTS, LLF } from 'arx-convert'
import type { ArxDLF, ArxFTS, ArxLLF } from 'arx-convert/types'
import type { OriginalLevel } from '@src/types.js'
import type { Settings } from '@platform/common/Settings.js'
import { fileOrFolderExists, readBinaryFile, readTextFile, writeTextFile } from '@platform/node/io.js'
import { createCacheFolderIfNotExists } from '@platform/node/services/cache.js'

export class LevelLoader {
  private readonly levelIdx: OriginalLevel
  private readonly settings: Settings

  constructor(levelIdx: OriginalLevel, settings: Settings) {
    this.levelIdx = levelIdx
    this.settings = settings
  }

  /**
   * @throws Error when binary dlf file doesn't exist
   */
  async readDlf(): Promise<ArxDLF> {
    const jsonFolder = await createCacheFolderIfNotExists(this.getCachedJsonFolder(), this.settings)
    const jsonFilename = path.resolve(jsonFolder, './' + this.getFilename('dlf') + '.json')

    try {
      const jsonData = await readTextFile(jsonFilename)
      return JSON.parse(jsonData) as ArxDLF
    } catch {
      const binaryFolder = this.getBinaryFolder()
      const binaryFilename = path.resolve(binaryFolder, './' + this.getFilename('dlf') + '.unpacked')

      if (!(await fileOrFolderExists(binaryFolder))) {
        throw new Error(`Attempted to read folder containing binary level data at "${binaryFolder}"`)
      }

      const binaryData = await readBinaryFile(binaryFilename)
      const data = DLF.load(binaryData)
      await writeTextFile(jsonFilename, JSON.stringify(data))
      return data
    }
  }

  /**
   * @throws Error when binary fts file doesn't exist
   */
  async readFts(): Promise<ArxFTS> {
    const jsonFolder = await createCacheFolderIfNotExists(this.getCachedJsonFolder(), this.settings)
    const jsonFilename = path.resolve(jsonFolder, './' + this.getFilename('fts') + '.json')

    try {
      const jsonData = await readTextFile(jsonFilename)
      return JSON.parse(jsonData) as ArxFTS
    } catch {
      const binaryFolder = this.getBinaryFolder()
      const binaryFilename = path.resolve(binaryFolder, './' + this.getFilename('fts') + '.unpacked')

      if (!(await fileOrFolderExists(binaryFolder))) {
        throw new Error(`Attempted to read folder containing binary level data at "${binaryFolder}"`)
      }

      const binaryData = await readBinaryFile(binaryFilename)
      const data = FTS.load(binaryData)
      await writeTextFile(jsonFilename, JSON.stringify(data))
      return data
    }
  }

  /**
   * @throws Error when binary llf file doesn't exist
   */
  async readLlf(): Promise<ArxLLF> {
    const jsonFolder = await createCacheFolderIfNotExists(this.getCachedJsonFolder(), this.settings)
    const jsonFilename = path.resolve(jsonFolder, './' + this.getFilename('llf') + '.json')

    try {
      const jsonData = await readTextFile(jsonFilename)
      return JSON.parse(jsonData) as ArxLLF
    } catch {
      const binaryFolder = this.getBinaryFolder()
      const binaryFilename = path.resolve(binaryFolder, './' + this.getFilename('llf') + '.unpacked')

      if (!(await fileOrFolderExists(binaryFolder))) {
        throw new Error(`Attempted to read folder containing binary level data at "${binaryFolder}"`)
      }

      const binaryData = await readBinaryFile(binaryFilename)
      const data = LLF.load(binaryData)
      await writeTextFile(jsonFilename, JSON.stringify(data))
      return data
    }
  }

  private getFilename(format: 'dlf' | 'fts' | 'llf'): string {
    if (format === 'fts') {
      return 'fast.fts'
    }

    return `level${this.levelIdx}.${format}`
  }

  /**
   * returned path is relative to `settings.cacheDir`
   */
  private getCachedJsonFolder(): string {
    return `./levels/level${this.levelIdx}`
  }

  private getBinaryFolder(): string {
    return path.resolve(this.settings.originalLevelFiles, `./arx-fatalis/level${this.levelIdx}`)
  }
}
