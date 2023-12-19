import fs from 'node:fs/promises'
import path from 'node:path'
import { DLF, FTS, LLF } from 'arx-convert'
import { ArxDLF, ArxFTS, ArxLLF } from 'arx-convert/types'
import { Settings } from '@src/Settings.js'
import { OriginalLevel } from '@src/types.js'
import { createCacheFolderIfNotExists } from '@services/cache.js'

export class LevelLoader {
  levelIdx: OriginalLevel
  settings: Settings

  constructor(levelIdx: OriginalLevel, settings: Settings) {
    this.levelIdx = levelIdx
    this.settings = settings
  }

  async readDlf() {
    return this.readData('dlf')
  }

  async readFts() {
    return this.readData('fts')
  }

  async readLlf() {
    return this.readData('llf')
  }

  async readData(format: 'dlf'): Promise<ArxDLF>
  async readData(format: 'fts'): Promise<ArxFTS>
  async readData(format: 'llf'): Promise<ArxLLF>
  async readData(format: 'dlf' | 'fts' | 'llf'): Promise<ArxDLF | ArxFTS | ArxLLF> {
    const jsonFolder = await createCacheFolderIfNotExists(this.getCachedJsonFolder(), this.settings)
    const jsonFilename = path.resolve(jsonFolder, './' + this.getFilename(format) + '.json')

    const parser = this.getParser(format)

    let data: ArxDLF | ArxFTS | ArxLLF

    try {
      const jsonData = await fs.readFile(jsonFilename, 'utf-8')
      data = JSON.parse(jsonData)
    } catch (e) {
      const binaryFolder = this.getBinaryFolder()
      const binaryFilename = path.resolve(binaryFolder, './' + this.getFilename(format) + '.unpacked')

      try {
        await fs.access(binaryFolder, fs.constants.R_OK | fs.constants.W_OK)
      } catch (e) {
        throw new Error(`attempted to read folder containing binary level data at "${binaryFolder}"`)
      }

      const binaryData = await fs.readFile(binaryFilename)
      data = parser.load(binaryData)
      await fs.writeFile(jsonFilename, JSON.stringify(data), 'utf-8')
    }

    return data
  }

  private getParser(format: 'dlf' | 'fts' | 'llf') {
    if (format === 'dlf') {
      return DLF
    }

    if (format === 'fts') {
      return FTS
    }

    return LLF
  }

  private getFilename(format: 'dlf' | 'fts' | 'llf') {
    if (format === 'fts') {
      return 'fast.fts'
    }

    return `level${this.levelIdx}.${format}`
  }

  private getCachedJsonFolder() {
    return `./levels/level${this.levelIdx}`
  }

  private getBinaryFolder() {
    return path.resolve(this.settings.originalLevelFiles, `./arx-fatalis/level${this.levelIdx}`)
  }
}
