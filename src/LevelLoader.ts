import path from 'node:path'
import { DLF, FTS, LLF } from 'arx-convert'
import type { ArxDLF, ArxFTS, ArxLLF } from 'arx-convert/types'
import type { Settings } from '@src/Settings.js'
import type { OriginalLevel } from '@src/types.js'
import { fileOrFolderExists, readBinaryFile, readTextFile, writeTextFile } from '@platform/node/io.js'
import { createCacheFolderIfNotExists } from '@services/cache.js'

export class LevelLoader {
  levelIdx: OriginalLevel
  settings: Settings

  constructor(levelIdx: OriginalLevel, settings: Settings) {
    this.levelIdx = levelIdx
    this.settings = settings
  }

  /**
   * @throws Error when binary dlf file doesn't exist
   */
  async readDlf(): Promise<ArxDLF> {
    return this.readData('dlf')
  }

  /**
   * @throws Error when binary fts file doesn't exist
   */
  async readFts(): Promise<ArxFTS> {
    return this.readData('fts')
  }

  /**
   * @throws Error when binary llf file doesn't exist
   */
  async readLlf(): Promise<ArxLLF> {
    return this.readData('llf')
  }

  /**
   * @throws Error when binary dlf, llf or fts files don't exist
   */
  async readData(format: 'dlf'): Promise<ArxDLF>
  async readData(format: 'fts'): Promise<ArxFTS>
  async readData(format: 'llf'): Promise<ArxLLF>
  async readData(format: 'dlf' | 'fts' | 'llf'): Promise<ArxDLF | ArxFTS | ArxLLF> {
    const jsonFolder = await createCacheFolderIfNotExists(this.getCachedJsonFolder(), this.settings)
    const jsonFilename = path.resolve(jsonFolder, './' + this.getFilename(format) + '.json')

    let data: ArxDLF | ArxFTS | ArxLLF

    switch (format) {
      case 'dlf': {
        const parser = this.getParser(format)

        try {
          const jsonData = await readTextFile(jsonFilename)
          data = JSON.parse(jsonData) as ArxDLF
        } catch {
          const binaryFolder = this.getBinaryFolder()
          const binaryFilename = path.resolve(binaryFolder, './' + this.getFilename(format) + '.unpacked')

          if (!(await fileOrFolderExists(binaryFolder))) {
            throw new Error(`Attempted to read folder containing binary level data at "${binaryFolder}"`)
          }

          const binaryData = await readBinaryFile(binaryFilename)
          data = parser.load(binaryData)
          await writeTextFile(jsonFilename, JSON.stringify(data))
        }

        break
      }

      case 'fts': {
        const parser = this.getParser(format)

        try {
          const jsonData = await readTextFile(jsonFilename)
          data = JSON.parse(jsonData) as ArxFTS
        } catch {
          const binaryFolder = this.getBinaryFolder()
          const binaryFilename = path.resolve(binaryFolder, './' + this.getFilename(format) + '.unpacked')

          if (!(await fileOrFolderExists(binaryFolder))) {
            throw new Error(`Attempted to read folder containing binary level data at "${binaryFolder}"`)
          }

          const binaryData = await readBinaryFile(binaryFilename)
          data = parser.load(binaryData)
          await writeTextFile(jsonFilename, JSON.stringify(data))
        }

        break
      }

      case 'llf': {
        const parser = this.getParser(format)

        try {
          const jsonData = await readTextFile(jsonFilename)
          data = JSON.parse(jsonData) as ArxLLF
        } catch {
          const binaryFolder = this.getBinaryFolder()
          const binaryFilename = path.resolve(binaryFolder, './' + this.getFilename(format) + '.unpacked')

          if (!(await fileOrFolderExists(binaryFolder))) {
            throw new Error(`Attempted to read folder containing binary level data at "${binaryFolder}"`)
          }

          const binaryData = await readBinaryFile(binaryFilename)
          data = parser.load(binaryData)
          await writeTextFile(jsonFilename, JSON.stringify(data))
        }

        break
      }
    }

    return data
  }

  private getParser(format: 'dlf'): typeof DLF
  private getParser(format: 'fts'): typeof FTS
  private getParser(format: 'llf'): typeof LLF
  private getParser(format: 'dlf' | 'fts' | 'llf'): typeof DLF | typeof FTS | typeof LLF {
    if (format === 'dlf') {
      return DLF
    }

    if (format === 'fts') {
      return FTS
    }

    return LLF
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
