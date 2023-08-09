import path from 'node:path'
import { fileURLToPath } from 'node:url'

type LightingCalculatorModes =
  | 'Distance'
  | 'Danae'
  | 'DistanceAngle'
  | 'DistanceAngleShadow'
  | 'DistanceAngleShadowNoTransparency'
  | 'GI'

type SettingsConstructorProps = {
  /**
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
   * default value is true
   * if there are no lights, then this gets set to false
   */
  calculateLighting?: boolean
  /**
   * default value is "DistanceAngleShadowNoTransparency"
   */
  lightingCalculatorMode?: LightingCalculatorModes
}

export class Settings {
  originalLevelFiles: string
  cacheFolder: string
  outputDir: string
  levelIdx: number
  assetsDir: string
  calculateLighting: boolean
  lightingCalculatorMode: LightingCalculatorModes
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

    const __filename = fileURLToPath(import.meta.url)
    const __dirname = path.dirname(__filename)

    this.internalAssetsDir = path.resolve(__dirname, '../../assets')
  }
}
