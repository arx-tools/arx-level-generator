import { ArxDLF, DLF } from 'arx-level-json-converter/dist/dlf/DLF'
import { ArxFTS, FTS } from 'arx-level-json-converter/dist/fts/FTS'
import { ArxLLF, LLF } from 'arx-level-json-converter/dist/llf/LLF'
import fs from 'node:fs'
import path from 'node:path'
import { OriginalLevel } from './types'

const { LEVELFILES = path.resolve(__dirname, '../pkware-test-files') } = process.env

export class LevelLoader {
  levelIdx: OriginalLevel

  constructor(levelIdx: OriginalLevel) {
    this.levelIdx = levelIdx
  }

  async readDlf() {
    return this.readData<ArxDLF>('dlf')
  }

  async readFts() {
    return this.readData<ArxFTS>('fts')
  }

  async readLlf() {
    return this.readData<ArxLLF>('llf')
  }

  async readData<T extends ArxDLF | ArxFTS | ArxLLF>(format: 'dlf' | 'fts' | 'llf') {
    await this.createCacheFolderIfNotExists()

    const parser = this.getParser(format)

    const jsonFolder = this.getJsonFolder()
    const jsonFilename = path.resolve(jsonFolder, './' + this.getFilename(format) + '.json')

    let data: T

    try {
      const jsonData = await fs.promises.readFile(jsonFilename, 'utf-8')
      data = JSON.parse(jsonData) as T
    } catch (e: unknown) {
      const binaryFolder = this.getBinaryFolder()
      const binaryFilename = path.resolve(binaryFolder, './' + this.getFilename(format) + '.unpacked')

      try {
        await fs.promises.access(binaryFolder, fs.promises.constants.R_OK | fs.promises.constants.W_OK)
      } catch (e: unknown) {
        throw new Error(`attempted to read folder containing binary level data at "${binaryFolder}"`)
      }

      const binaryData = await fs.promises.readFile(binaryFilename)
      data = parser.load(binaryData) as T
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
    return path.resolve(__dirname, `../.cache/levels/level${this.levelIdx}`)
  }

  private getBinaryFolder() {
    return path.resolve(LEVELFILES, `./arx-fatalis/level${this.levelIdx}`)
  }

  private async createCacheFolderIfNotExists() {
    const jsonFolder = this.getJsonFolder()

    try {
      await fs.promises.access(jsonFolder, fs.promises.constants.R_OK | fs.promises.constants.W_OK)
    } catch (e: unknown) {
      await fs.promises.mkdir(jsonFolder, { recursive: true })
    }
  }
}
