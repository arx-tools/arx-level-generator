export const lightingCalculatorModes = ['MaxBrightness', 'CompleteDarkness', 'Arx', 'Realistic'] as const

export type LightingCalculatorMode = (typeof lightingCalculatorModes)[number]

export const defaultLightingCalculatorMode = 'Arx'

export function isValidLightingCalculatorMode(input: any): input is LightingCalculatorMode {
  return typeof input === 'string' && (lightingCalculatorModes as readonly string[]).includes(input)
}

// -----------

export const modes = ['development', 'production'] as const

export type Mode = (typeof modes)[number]

export const defaultMode: Mode = 'production'

export function isValidMode(input: any): input is 'development' | 'production' {
  return typeof input === 'string' && (modes as readonly string[]).includes(input)
}

// -----------

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
   * can also be set via `process.env.assetsDir`
   *
   * default value is "./assets" relative to the project root
   */
  assetsDir?: string

  /**
   * can also be set via `process.env.levelIdx`
   *
   * default value is 1
   */
  levelIdx?: number

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
  mode?: Mode

  /**
   * When this is set to true FTS files will not get compressed with pkware
   * after compiling. This is an Arx Libertatis 1.3+ feature!
   *
   * default value is false
   */
  uncompressedFTS?: boolean
}

// -----------

export interface Settings {
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
   * can also be set via `process.env.assetsDir`
   *
   * default value is "./assets" relative to the project root
   */
  readonly assetsDir: string

  /**
   * can also be set via `process.env.levelIdx`
   *
   * default value is 1
   */
  readonly levelIdx: number

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
  readonly mode: Mode

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
}
