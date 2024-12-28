import { type Expand } from 'arx-convert/utils'

export type Modes = 'development' | 'production'

const lightingCalculatorModes = ['NoLighting', 'Danae', 'Realistic'] as const

export type LightingCalculatorMode = (typeof lightingCalculatorModes)[number]

export function isValidLightingCalculatorMode(input: any): input is LightingCalculatorMode {
  return typeof input === 'string' && (lightingCalculatorModes as readonly string[]).includes(input)
}

export interface Settings {
  /**
   * default value is true
   * if there are no lights, then this gets set to false
   *
   * if set to false, but the map already has lighting information precalculated (like when loading
   * an existing arx level) then the lighting information is kept as is
   */
  readonly calculateLighting: boolean

  /**
   * possible values:
   *
   * - "NoLighting" - sets everyting to the maximum brightness, useful for checking edits to a mesh
   * - "Danae" - the default look of Arx: shadows are not cast by polygons, everything is lit evenly
   * - "Realistic" - polygons cast shadows if obstructing the lights
   *
   * default value is "Danae"
   */
  readonly lightingCalculatorMode: LightingCalculatorMode

  /**
   * default value is 1
   */
  readonly levelIdx: number

  /**
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
   * default value is "production"
   */
  readonly mode: Modes

  /**
   * When this is set to true FTS files will not get compressed with pkware
   * after compiling. This is an Arx Libertatis 1.3+ feature!
   *
   * default value is false
   */
  readonly uncompressedFTS: boolean

  /**
   * arx-level-generator comes with its own assets, this is the folder which
   * contains those assets
   *
   * the level generator reads from this folder
   */
  readonly internalAssetsDir: string

  /**
   * Every project can have its own assets, this folder holds them
   *
   * the level generator reads from this folder
   */
  readonly assetsDir: string

  /**
   * A folder to load the unpacked DLF, LLF and FTS files of the
   * original game from
   *
   * the level generator reads from this folder
   */
  readonly originalLevelFiles: string

  /**
   * A folder where arx-level-generator will place files that can be
   * reused multiple times
   *
   * the level generator writes to this folder (and creates it if non-existant)
   */
  readonly cacheFolder: string

  /**
   * The folder in which the generated files will be placed
   *
   * the level generator writes to this folder (and creates it if non-existant)
   */
  readonly outputDir: string
}

export type SettingsConstructorProps = Expand<Exclude<Partial<Settings>, 'internalAssetsDir'>>
