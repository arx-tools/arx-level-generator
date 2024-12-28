import { type Expand } from 'arx-convert/utils'
import seedrandom from 'seedrandom'
import { randomIntBetween } from '@src/random.js'
import {
  type Modes,
  type Settings as ISettings,
  type LightingCalculatorMode,
  type SettingsConstructorProps,
} from '@src/Settings.js'

export class Settings implements ISettings {
  readonly calculateLighting: boolean
  readonly lightingCalculatorMode: LightingCalculatorMode
  readonly levelIdx: number
  readonly seed: string
  readonly mode: Modes
  readonly uncompressedFTS: boolean
  readonly internalAssetsDir: string
  readonly assetsDir: string
  readonly originalLevelFiles: string
  readonly cacheFolder: string
  readonly outputDir: string

  constructor(
    props: Expand<
      Exclude<SettingsConstructorProps, 'assetsDir' | 'originalLevelFiles' | 'cacheFolder' | 'outputDir'>
    > = {},
  ) {
    this.levelIdx = props.levelIdx ?? 1

    this.calculateLighting = props.calculateLighting ?? true

    this.lightingCalculatorMode = props.lightingCalculatorMode ?? 'Danae'

    this.mode = props.mode ?? 'production'

    this.uncompressedFTS = props.uncompressedFTS ?? false

    this.seed = props.seed ?? randomIntBetween(100_000_000, 999_999_999).toString()
    seedrandom(this.seed, { global: true })

    this.internalAssetsDir = '/assets'
    this.assetsDir = '/assets'
    this.originalLevelFiles = '/assets'
    this.cacheFolder = '/'
    this.outputDir = '/'
  }
}
