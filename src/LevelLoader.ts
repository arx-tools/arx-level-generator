import { ArxDLF, DLF } from 'arx-level-json-converter/dist/dlf/DLF'
import { ArxFTS, FTS } from 'arx-level-json-converter/dist/fts/FTS'
import { ArxLLF, LLF } from 'arx-level-json-converter/dist/llf/LLF'
import fs from 'node:fs'
import path from 'node:path'
import { OriginalLevel } from './types'

const { LEVELFILES = path.resolve(__dirname, '../pkware-test-files') } = process.env

const CACHE_FOLDER = path.resolve(__dirname, '../.cache')

/*
const rawDlf = await fs.promises.readFile(path.resolve(jsonFolder, `./level${levelIdx}.dlf.json`), 'utf-8')
const dlf = JSON.parse(rawDlf) as ArxDLF

const rawFts = await fs.promises.readFile(path.resolve(jsonFolder, `./fast.fts.json`), 'utf-8')
const fts = JSON.parse(rawFts) as ArxFTS

const rawLlf = await fs.promises.readFile(path.resolve(jsonFolder, `./level${levelIdx}.llf.json`), 'utf-8')
const llf = JSON.parse(rawLlf) as ArxLLF
*/

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

  async readData<T>(format: 'dlf' | 'fts' | 'llf') {
    await this.createCacheFolderIfNotExists()

    const parser = format === 'dlf' ? DLF : format === 'fts' ? FTS : LLF

    const jsonFolder = this.getJsonFolder()
    const jsonFilename = path.resolve(
      jsonFolder,
      format === 'fts' ? `./fast.${format}.json` : `./level${this.levelIdx}.${format}.json`,
    )

    let data: T

    try {
      const jsonData = await fs.promises.readFile(jsonFilename, 'utf-8')
      data = JSON.parse(jsonData) as T
    } catch (e: unknown) {
      const binaryFolder = this.getBinaryFolder()
      const binaryFilename = path.resolve(
        binaryFolder,
        format === 'fts' ? `./fast.${format}.unpacked` : `./level${this.levelIdx}.${format}.unpacked`,
      )

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
