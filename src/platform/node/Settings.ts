import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { config as dotenvConfig } from 'dotenv'
import seedrandom from 'seedrandom'
import { randomIntBetween } from '@src/random.js'
import {
  type Modes,
  type Settings as ISettings,
  type LightingCalculatorMode,
  isValidLightingCalculatorMode,
  type SettingsConstructorProps,
} from '@src/Settings.js'

dotenvConfig()

export class Settings implements ISettings {
  readonly calculateLighting: boolean
  readonly lightingCalculatorMode: LightingCalculatorMode
  readonly levelIdx: number
  readonly seed: string
  readonly mode: Modes
  readonly uncompressedFTS: boolean
  readonly internalAssetsDir: string

  /**
   * Every project can have its own assets, this folder holds them
   *
   * the level generator reads from this folder
   *
   * default value is "./assets" relative to the project root
   */
  readonly assetsDir: string

  /**
   * A folder to load the unpacked DLF, LLF and FTS files of the
   * original game from
   *
   * the level generator reads from this folder
   *
   * default value is "../pkware-test-files" relative to the project root
   */
  readonly originalLevelFiles: string

  /**
   * A folder where arx-level-generator will place files that can be
   * reused multiple times
   *
   * the level generator writes to this folder (and creates it if non-existant)
   *
   * default value is "./cache" relative to the project root
   */
  readonly cacheDir: string
  /**
   * The folder in which the generated files will be placed
   *
   * the level generator writes to this folder (and creates it if non-existant)
   *
   * default value is "./output" relative to the project root
   */
  readonly outputDir: string

  /**
   * Individual properties can be omitted from `props` and be replaced by reading it from the `.env` file
   * or by setting it as a property of process.env, like `process.env.lightingCalculatorMode`
   */
  constructor(props: SettingsConstructorProps = {}) {
    this.levelIdx = props.levelIdx ?? Number.parseInt(process.env.levelIdx ?? '1', 10)

    this.calculateLighting = props.calculateLighting ?? process.env.calculateLighting !== 'false'

    let fallbackLCM: LightingCalculatorMode
    if (isValidLightingCalculatorMode(process.env.lightingCalculatorMode)) {
      fallbackLCM = process.env.lightingCalculatorMode
    } else {
      fallbackLCM = 'Arx'
    }

    this.lightingCalculatorMode = props.lightingCalculatorMode ?? fallbackLCM

    let fallbackMode: Modes
    if (process.env.mode === 'development') {
      fallbackMode = process.env.mode
    } else {
      fallbackMode = 'production'
    }

    this.mode = props.mode ?? fallbackMode

    this.uncompressedFTS = props.uncompressedFTS ?? process.env.uncompressedFTS === 'true'

    this.seed = props.seed ?? process.env.seed ?? randomIntBetween(100_000_000, 999_999_999).toString()
    seedrandom(this.seed, { global: true })

    const filename = fileURLToPath(import.meta.url)
    const dirname = path.dirname(filename)

    this.internalAssetsDir = path.resolve(dirname, '../assets')

    this.assetsDir = props.assetsDir ?? process.env.assetsDir ?? path.resolve('./assets')
    this.originalLevelFiles =
      props.originalLevelFiles ?? process.env.originalLevelFiles ?? path.resolve('../pkware-test-files')

    this.cacheDir = props.cacheDir ?? process.env.cacheDir ?? path.resolve('./cache')
    this.outputDir = props.outputDir ?? process.env.outputDir ?? path.resolve('./output')
  }
}
