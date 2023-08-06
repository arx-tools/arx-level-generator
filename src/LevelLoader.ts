import fs from 'node:fs'
import path from 'node:path'
import { DLF, FTS, LLF } from 'arx-convert'
import { ArxDLF, ArxFTS, ArxLLF } from 'arx-convert/types'
import { Settings } from '@src/Settings.js'
import { OriginalLevel } from '@src/types.js'

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
    await this.createCacheFolderIfNotExists()

    const parser = this.getParser(format)

    const jsonFolder = this.getJsonFolder()
    const jsonFilename = path.resolve(jsonFolder, './' + this.getFilename(format) + '.json')

    let data: ArxDLF | ArxFTS | ArxLLF

    try {
      const jsonData = await fs.promises.readFile(jsonFilename, 'utf-8')
      data = JSON.parse(jsonData)
    } catch (e) {
      const binaryFolder = this.getBinaryFolder()
      const binaryFilename = path.resolve(binaryFolder, './' + this.getFilename(format) + '.unpacked')

      try {
        await fs.promises.access(binaryFolder, fs.promises.constants.R_OK | fs.promises.constants.W_OK)
      } catch (e) {
        throw new Error(`attempted to read folder containing binary level data at "${binaryFolder}"`)
      }

      const binaryData = await fs.promises.readFile(binaryFilename)
      data = parser.load(binaryData)
      await fs.promises.writeFile(jsonFilename, JSON.stringify(data), 'utf-8')
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

  private getJsonFolder() {
    return path.resolve(this.settings.cacheFolder, `./levels/level${this.levelIdx}`)
  }

  private getBinaryFolder() {
    return path.resolve(this.settings.originalLevelFiles, `./arx-fatalis/level${this.levelIdx}`)
  }

  private async createCacheFolderIfNotExists() {
    const jsonFolder = this.getJsonFolder()

    try {
      await fs.promises.access(jsonFolder, fs.promises.constants.R_OK | fs.promises.constants.W_OK)
    } catch (e) {
      await fs.promises.mkdir(jsonFolder, { recursive: true })
    }
  }
}
