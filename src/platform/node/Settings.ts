import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { config as dotenvConfig } from 'dotenv'
import seedrandom from 'seedrandom'
import { createRandomSeed } from '@src/random.js'
import {
  defaultLightingCalculatorMode,
  defaultMode,
  isValidLightingCalculatorMode,
  isValidMode,
  type Settings as ISettings,
  type LightingCalculatorMode,
  type Mode,
  type SettingsConstructorProps,
} from '@platform/common/Settings.js'

dotenvConfig()

export class Settings implements ISettings {
  readonly originalLevelFiles: string
  readonly cacheDir: string
  readonly outputDir: string
  readonly assetsDir: string
  readonly levelIdx: number
  readonly calculateLighting: boolean
  readonly lightingCalculatorMode: LightingCalculatorMode
  readonly seed: string
  readonly mode: Mode
  readonly internalAssetsDir: string
  readonly uncompressedFTS: boolean

  constructor(props: SettingsConstructorProps = {}) {
    this.levelIdx = props.levelIdx ?? Number.parseInt(process.env.levelIdx ?? '1', 10)
    this.calculateLighting = props.calculateLighting ?? process.env.calculateLighting !== 'false'
    this.lightingCalculatorMode = this.parseLightingCalculatorMode(props.lightingCalculatorMode)
    this.mode = this.parseMode(props.mode)
    this.uncompressedFTS = props.uncompressedFTS ?? process.env.uncompressedFTS === 'true'
    this.seed = props.seed ?? process.env.seed ?? createRandomSeed()
    this.internalAssetsDir = this.getInternalAssetsDir()
    this.assetsDir = props.assetsDir ?? process.env.assetsDir ?? path.resolve('./assets')
    // prettier-ignore
    this.originalLevelFiles = props.originalLevelFiles ?? process.env.originalLevelFiles ?? path.resolve('../pkware-test-files')
    this.cacheDir = props.cacheDir ?? process.env.cacheDir ?? path.resolve('./cache')
    this.outputDir = props.outputDir ?? process.env.outputDir ?? path.resolve('./output')

    seedrandom(this.seed, { global: true })
  }

  // prettier-ignore
  private parseLightingCalculatorMode(lightingCalculatorMode: SettingsConstructorProps['lightingCalculatorMode']): LightingCalculatorMode {
    if (lightingCalculatorMode !== undefined) {
      return lightingCalculatorMode
    }

    if (isValidLightingCalculatorMode(process.env.lightingCalculatorMode)) {
      return process.env.lightingCalculatorMode
    }

    return defaultLightingCalculatorMode
  }

  private parseMode(mode: SettingsConstructorProps['mode']): Mode {
    if (mode !== undefined) {
      return mode
    }

    if (isValidMode(process.env.mode)) {
      return process.env.mode
    }

    return defaultMode
  }

  private getInternalAssetsDir(): string {
    const pathToThisFile = fileURLToPath(import.meta.url)
    const dirContainingThisFile = path.dirname(pathToThisFile)
    return path.resolve(dirContainingThisFile, '../../../assets')
  }
}
