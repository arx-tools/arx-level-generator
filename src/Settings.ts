import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { config as dotenvConfig } from 'dotenv'
import seedrandom from 'seedrandom'
import { randomIntBetween } from '@src/random.js'

dotenvConfig()

const lightingCalculatorModes = ['MaxBrightness', 'CompleteDarkness', 'Arx', 'Realistic'] as const

type LightingCalculatorMode = (typeof lightingCalculatorModes)[number]

function isValidLightingCalculatorMode(input: any): input is LightingCalculatorMode {
  return typeof input === 'string' && (lightingCalculatorModes as readonly string[]).includes(input)
}

type Modes = 'development' | 'production'

export type SettingsConstructorProps = {
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
   * can also be set via `process.env.cacheDir`
   *
   * default value is "./cache" relative to the project root
   */
  cacheDir?: string
  /**
   * can also be set via `process.env.outputDir`
   *
   * default value is "./output" relative to the project root
   */
  outputDir?: string
  /**
   * can also be set via `process.env{calculateLighting: Settings[calculateLighting]}.levelIdx`
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
   *
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
   * - "MaxBrightness" - sets everyting to the maximum brightness, useful for checking edits to a mesh
   * - "CompleteDarkness" - every polygon of the mesh is as dark as it can be, ignores lights
   * - "Arx" - the default look of Arx: shadows are not cast by polygons, everything is lit evenly
   * - "Realistic" - polygons cast shadows if obstructing the lights
   *
   * default value is "Arx"
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
   * can also be set via `process.env.cacheDir`
   *
   * default value is "./cache" relative to the project root
   */
  readonly cacheDir: string
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
   * default value is "Arx"
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

    const pathToThisFile = fileURLToPath(import.meta.url)
    const dirContainingThisFile = path.dirname(pathToThisFile)
    this.internalAssetsDir = path.resolve(dirContainingThisFile, '../assets')

    this.assetsDir = props.assetsDir ?? process.env.assetsDir ?? path.resolve('./assets')

    this.originalLevelFiles =
      props.originalLevelFiles ?? process.env.originalLevelFiles ?? path.resolve('../pkware-test-files')

    this.cacheDir = props.cacheDir ?? process.env.cacheDir ?? path.resolve('./cache')
    this.outputDir = props.outputDir ?? process.env.outputDir ?? path.resolve('./output')
  }
}
