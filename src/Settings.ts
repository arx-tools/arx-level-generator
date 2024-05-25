import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { config as dotenvConfig } from 'dotenv'
import seedrandom from 'seedrandom'
import { randomIntBetween } from '@src/random.js'

dotenvConfig()

const lightingCalculatorModes = [
  'Distance',
  'Danae',
  'DistanceAngle',
  'DistanceAngleShadow',
  'DistanceAngleShadowNoTransparency',
  'GI',
] as const

type LightingCalculatorMode = (typeof lightingCalculatorModes)[number]

const isValidLightingCalculatorMode = (input: any): input is LightingCalculatorMode => {
  return typeof input === 'string' && (lightingCalculatorModes as ReadonlyArray<string>).includes(input)
}

type Modes = 'development' | 'production'

type SettingsConstructorProps = {
  /**
   * A folder to load the unpacked DLF, LLF and FTS files of the
   * original game
   *
   * can also be set via `process.env.originalLevelFiles`
   *
   * default value is "../pkware-test-files" relative to the project root
   */
  originalLevelFiles?: string
  /**
   * can also be set via `process.env.cacheFolder`
   *
   * default value is "./cache" relative to the project root
   */
  cacheFolder?: string
  /**
   * can also be set via `process.env.outputDir`
   *
   * default value is "./output" relative to the project root
   */
  outputDir?: string
  /**
   * can also be set via `process.env.levelIdx`
   *
   * default value is 1
   */
  levelIdx?: number
  /**
   * can also be set via `process.env.assetsDir`
   *
   * default value is "./assets" relative to the project root
   */
  assetsDir?: string
  /**
   * can also be set via `process.env.calculateLighting`
   *
   * This flag tells whether to run Fredlllll's lighting calculator
   * after building the llf files
   *
   * default value is true
   * if there are no lights, then this gets set to false
   */
  calculateLighting?: boolean
  /**
   * can also be set via `process.env.lightingCalculatorMode`
   *
   * default value is "DistanceAngleShadowNoTransparency"
   */
  lightingCalculatorMode?: LightingCalculatorMode
  /**
   * can also be set via `process.env.seed`
   *
   * default value is a string with a random number
   * between 100.000.000 and 999.999.999
   */
  seed?: string
  /**
   * This field allows branching the code based on what phase the project
   * is in. For example a cutscene in the beginning of a map can be turned
   * off while developing the map in development mode, but re-enabled in
   * production mode
   *
   * can also be set via `process.env.mode`
   *
   * default value is "production"
   */
  mode?: Modes
  /**
   * When this is set to true FTS files will not get compressed with pkware
   * after compiling. This is an Arx Libertatis 1.3+ feature!
   */
  uncompressedFTS?: boolean
}

export class Settings {
  /**
   * A folder to load the unpacked DLF, LLF and FTS files of the
   * original game
   *
   * can also be set via `process.env.originalLevelFiles`
   *
   * default value is "../pkware-test-files" relative to the project root
   */
  readonly originalLevelFiles: string
  /**
   * can also be set via `process.env.cacheFolder`
   *
   * default value is "./cache" relative to the project root
   */
  readonly cacheFolder: string
  /**
   * can also be set via `process.env.outputDir`
   *
   * default value is "./output" relative to the project root
   */
  readonly outputDir: string
  /**
   * can also be set via `process.env.levelIdx`
   *
   * default value is 1
   */
  readonly levelIdx: number
  /**
   * can also be set via `process.env.assetsDir`
   *
   * default value is "./assets" relative to the project root
   */
  readonly assetsDir: string
  /**
   * can also be set via `process.env.calculateLighting`
   *
   * This flag tells whether to run Fredlllll's lighting calculator
   * after building the llf files
   *
   * default value is true
   * if there are no lights, then this gets set to false
   */
  readonly calculateLighting: boolean
  /**
   * can also be set via `process.env.lightingCalculatorMode`
   *
   * default value is "DistanceAngleShadowNoTransparency"
   */
  readonly lightingCalculatorMode: LightingCalculatorMode
  /**
   * can also be set via `process.env.seed`
   *
   * default value is a string with a random number
   * between 100.000.000 and 999.999.999
   */
  readonly seed: string
  /**
   * This field allows branching the code based on what phase the project
   * is in. For example a cutscene in the beginning of a map can be turned
   * off while developing the map in development mode, but re-enabled in
   * production mode
   *
   * can also be set via `process.env.mode`
   *
   * default value is "production"
   */
  readonly mode: Modes

  /**
   * arx-level-generator comes with its own assets folder
   */
  readonly internalAssetsDir: string

  /**
   * When this is set to true FTS files will not get compressed with pkware
   * after compiling. This is an Arx Libertatis 1.3+ feature!
   */
  readonly uncompressedFTS: boolean

  constructor(props: SettingsConstructorProps = {}) {
    this.originalLevelFiles =
      props.originalLevelFiles ?? process.env.originalLevelFiles ?? path.resolve('../pkware-test-files')

    this.cacheFolder = props.cacheFolder ?? process.env.cacheFolder ?? path.resolve('./cache')
    this.outputDir = props.outputDir ?? process.env.outputDir ?? path.resolve('./output')
    this.levelIdx = props.levelIdx ?? parseInt(process.env.levelIdx ?? '1')
    this.assetsDir = props.assetsDir ?? process.env.assetsDir ?? path.resolve('./assets')
    this.calculateLighting = props.calculateLighting ?? (process.env.calculateLighting === 'false' ? false : true)

    this.lightingCalculatorMode =
      props.lightingCalculatorMode ??
      (isValidLightingCalculatorMode(process.env.lightingCalculatorMode)
        ? process.env.lightingCalculatorMode
        : 'DistanceAngleShadowNoTransparency')

    this.seed = props.seed ?? process.env.seed ?? randomIntBetween(100_000_000, 999_999_999).toString()
    this.mode = props.mode ?? (process.env.mode === 'development' ? process.env.mode : 'production')

    this.uncompressedFTS = props.uncompressedFTS ?? process.env.uncompressedFTS === 'true'

    seedrandom(this.seed, { global: true })

    const __filename = fileURLToPath(import.meta.url)
    const __dirname = path.dirname(__filename)

    this.internalAssetsDir = path.resolve(__dirname, '../../assets')
  }
}
