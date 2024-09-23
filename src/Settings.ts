import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { config as dotenvConfig } from 'dotenv'
import seedrandom from 'seedrandom'
import { randomIntBetween } from '@src/random.js'

dotenvConfig()

const lightingCalculatorModes = ['Danae', 'Fredlllll'] as const

type LightingCalculatorMode = (typeof lightingCalculatorModes)[number]

function isValidLightingCalculatorMode(input: any): input is LightingCalculatorMode {
  return typeof input === 'string' && (lightingCalculatorModes as readonly string[]).includes(input)
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
   * default value is true
   * if there are no lights, then this gets set to false
   *
   * if set to false, but the map already has lighting information precalculated (like when loading
   * an existing arx level) then the lighting information is kept as is
   */
  calculateLighting?: boolean
  /**
   * can also be set via `process.env.lightingCalculatorMode`
   *
   * potential values:
   *
   * - `"Danae"` - no shadows, same as what DANAE creates, OG Arx look and feel
   * - `"Fredlllll"` - shadow calculation, same as "DistanceAngleShadowNoTransparency" in Fred's lighting generator
   *
   * default value is "Danae"
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
   *
   * default value is false
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
   * default value is true
   * if there are no lights, then this gets set to false
   *
   * if set to false, but the map already has lighting information precalculated (like when loading
   * an existing arx level) then the lighting information is kept as is
   */
  readonly calculateLighting: boolean
  /**
   * can also be set via `process.env.lightingCalculatorMode`
   *
   * default value is "Danae"
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
   *
   * default value is false
   */
  readonly uncompressedFTS: boolean

  constructor(props: SettingsConstructorProps = {}) {
    this.originalLevelFiles =
      props.originalLevelFiles ?? process.env.originalLevelFiles ?? path.resolve('../pkware-test-files')

    this.cacheFolder = props.cacheFolder ?? process.env.cacheFolder ?? path.resolve('./cache')
    this.outputDir = props.outputDir ?? process.env.outputDir ?? path.resolve('./output')
    this.levelIdx = props.levelIdx ?? Number.parseInt(process.env.levelIdx ?? '1', 10)
    this.assetsDir = props.assetsDir ?? process.env.assetsDir ?? path.resolve('./assets')
    this.calculateLighting = props.calculateLighting ?? process.env.calculateLighting !== 'false'

    let fallbackLCM: LightingCalculatorMode
    if (isValidLightingCalculatorMode(process.env.lightingCalculatorMode)) {
      fallbackLCM = process.env.lightingCalculatorMode
    } else {
      fallbackLCM = 'Danae'
    }

    this.lightingCalculatorMode = props.lightingCalculatorMode ?? fallbackLCM

    this.seed = props.seed ?? process.env.seed ?? randomIntBetween(100_000_000, 999_999_999).toString()

    let fallbackMode: Modes
    if (process.env.mode === 'development') {
      fallbackMode = process.env.mode
    } else {
      fallbackMode = 'production'
    }

    this.mode = props.mode ?? fallbackMode

    this.uncompressedFTS = props.uncompressedFTS ?? process.env.uncompressedFTS === 'true'

    seedrandom(this.seed, { global: true })

    const filename = fileURLToPath(import.meta.url)
    const dirname = path.dirname(filename)

    this.internalAssetsDir = path.resolve(dirname, '../assets')
  }
}
