import seedrandom from 'seedrandom'
import { createRandomSeed } from '@src/random.js'
import {
  defaultLightingCalculatorMode,
  defaultMode,
  type LightingCalculatorMode,
  type Mode,
  type Settings as ISettings,
  type SettingsConstructorProps,
} from '@platform/common/Settings.js'

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
    this.levelIdx = props.levelIdx ?? 1
    this.calculateLighting = props.calculateLighting ?? true
    this.lightingCalculatorMode = this.parseLightingCalculatorMode(props.lightingCalculatorMode)
    this.mode = this.parseMode(props.mode)
    this.uncompressedFTS = props.uncompressedFTS ?? false
    this.seed = props.seed ?? createRandomSeed()
    this.internalAssetsDir = this.getInternalAssetsDir()

    // TODO

    // this.assetsDir = props.assetsDir ?? path.resolve('./assets')
    // this.originalLevelFiles = props.originalLevelFiles ?? path.resolve('../pkware-test-files')
    // this.cacheDir = props.cacheDir ?? path.resolve('./cache')
    // this.outputDir = props.outputDir ?? path.resolve('./output')

    this.assetsDir = ''
    this.originalLevelFiles = ''
    this.cacheDir = ''
    this.outputDir = ''

    seedrandom(this.seed, { global: true })
  }

  // prettier-ignore
  private parseLightingCalculatorMode(lightingCalculatorMode: SettingsConstructorProps['lightingCalculatorMode']): LightingCalculatorMode {
    if (lightingCalculatorMode !== undefined) {
      return lightingCalculatorMode
    }

    return defaultLightingCalculatorMode
  }

  private parseMode(mode: SettingsConstructorProps['mode']): Mode {
    if (mode !== undefined) {
      return mode
    }

    return defaultMode
  }

  private getInternalAssetsDir(): string {
    // TODO

    // const pathToThisFile = fileURLToPath(import.meta.url)
    // const dirContainingThisFile = path.dirname(pathToThisFile)
    // return path.resolve(dirContainingThisFile, '../assets')

    return ''
  }
}
