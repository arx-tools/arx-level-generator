import type { Simplify } from 'type-fest'
import seedrandom from 'seedrandom'
import type {
  Settings as ISettings,
  LightingCalculatorMode,
  SettingsConstructorProps,
} from '@platform/common/Settings.js'
import type { Modes, PackageJsonProps } from '@platform/common/types.js'
import { Manifest } from '@platform/browser/Manifest.js'
import { createRandomSeed } from '@src/helpers.js'

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
  readonly cacheDir: string
  readonly outputDir: string

  // ----------

  readonly manifest: Manifest

  // ----------

  constructor(
    props: Simplify<
      Exclude<SettingsConstructorProps, 'assetsDir' | 'originalLevelFiles' | 'cacheDir' | 'outputDir'>
    > = {},
  ) {
    this.levelIdx = props.levelIdx ?? 1

    this.calculateLighting = props.calculateLighting ?? true

    this.lightingCalculatorMode = props.lightingCalculatorMode ?? 'Arx'

    this.mode = props.mode ?? 'production'

    this.uncompressedFTS = props.uncompressedFTS ?? false

    this.seed = props.seed ?? createRandomSeed()
    seedrandom(this.seed, { global: true })

    this.internalAssetsDir = '/assets'
    this.assetsDir = '/assets'
    this.originalLevelFiles = '/assets'
    this.cacheDir = '/'
    this.outputDir = '/'

    // ----------

    this.manifest = new Manifest(this)
  }

  async getGeneratorPackageJSON(): Promise<PackageJsonProps> {
    return {
      name: 'arx-level-generator',
      version: '',
      description: '',
      author: '',
      homepage: '',
    }
  }

  async getProjectPackageJSON(): Promise<PackageJsonProps> {
    return {
      name: '',
      version: '',
      description: '',
      author: '',
      homepage: '',
    }
  }
}
