import path from 'node:path'
import { fileURLToPath } from 'node:url'
import seedrandom from 'seedrandom'
import { randomIntBetween } from './random.js'

type LightingCalculatorModes =
  | 'Distance'
  | 'Danae'
  | 'DistanceAngle'
  | 'DistanceAngleShadow'
  | 'DistanceAngleShadowNoTransparency'
  | 'GI'

type Versions = 'normal' | 'premium'

type Modes = 'development' | 'production'

type SettingsConstructorProps = {
  /**
   * A folder to load the unpacked DLF, LLF and FTS files of the
   * original game
   *
   * default value is "../pkware-test-files" relative to the project root
   */
  originalLevelFiles?: string
  /**
   * default value is "./.cache" relative to the project root
   */
  cacheFolder?: string
  /**
   * default value is "./output" relative to the project root
   */
  outputDir?: string
  /**
   * default value is 1
   */
  levelIdx?: number
  /**
   * default value is "./assets" relative to the project root
   */
  assetsDir?: string
  /**
   * This flag tells whether to run Fredlllll's lighting calculator
   * after building the llf files
   *
   * default value is true
   * if there are no lights, then this gets set to false
   */
  calculateLighting?: boolean
  /**
   * default value is "DistanceAngleShadowNoTransparency"
   */
  lightingCalculatorMode?: LightingCalculatorModes
  /**
   * default value is a string with a random number
   * between 100.000.000 and 999.999.999
   */
  seed?: string
  /**
   * This field allows branching between normal and premium versions
   *
   * default value is Versions.Normal
   */
  version?: Versions
  /**
   * This field allows branching the code based on what phase the project
   * is in. For example a cutscene in the beginning of a map can be turned
   * off while developing the map in development mode, but re-enabled in
   * production mode
   *
   * default value is "production"
   */
  mode?: Modes
}

export class Settings {
  /**
   * A folder to load the unpacked DLF, LLF and FTS files of the
   * original game
   *
   * default value is "../pkware-test-files" relative to the project root
   */
  readonly originalLevelFiles: string
  /**
   * default value is "./.cache" relative to the project root
   */
  readonly cacheFolder: string
  /**
   * default value is "./output" relative to the project root
   */
  readonly outputDir: string
  /**
   * default value is 1
   */
  readonly levelIdx: number
  /**
   * default value is "./assets" relative to the project root
   */
  readonly assetsDir: string
  /**
   * This flag tells whether to run Fredlllll's lighting calculator
   * after building the llf files
   *
   * default value is true
   * if there are no lights, then this gets set to false
   */
  readonly calculateLighting: boolean
  /**
   * default value is "DistanceAngleShadowNoTransparency"
   */
  readonly lightingCalculatorMode: LightingCalculatorModes
  /**
   * default value is a string with a random number
   * between 100.000.000 and 999.999.999
   */
  readonly seed: string
  /**
   * This field allows branching between "normal" and "premium" versions
   *
   * default value is "normal"
   */
  readonly version: Versions
  /**
   * This field allows branching the code based on what phase the project
   * is in. For example a cutscene in the beginning of a map can be turned
   * off when in development mode
   *
   * default value is "production"
   */
  readonly mode: Modes
  /**
   * arx-level-generator comes with its own assets folder
   */
  readonly internalAssetsDir: string

  constructor(props: SettingsConstructorProps = {}) {
    this.originalLevelFiles = props.originalLevelFiles ?? path.resolve('../pkware-test-files')
    this.cacheFolder = props.cacheFolder ?? path.resolve('./.cache')
    this.outputDir = props.outputDir ?? path.resolve('./output')
    this.levelIdx = props.levelIdx ?? 1
    this.assetsDir = props.assetsDir ?? path.resolve('./assets')
    this.calculateLighting = props.calculateLighting ?? true
    this.lightingCalculatorMode = props.lightingCalculatorMode ?? 'DistanceAngleShadowNoTransparency'
    this.seed = props.seed ?? randomIntBetween(100_000_000, 999_999_999).toString()
    this.version = props.version ?? 'normal'
    this.mode = props.mode ?? 'production'

    seedrandom(this.seed, { global: true })

    const __filename = fileURLToPath(import.meta.url)
    const __dirname = path.dirname(__filename)

    this.internalAssetsDir = path.resolve(__dirname, '../../assets')
  }
}
