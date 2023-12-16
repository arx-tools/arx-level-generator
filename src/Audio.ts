import path from 'node:path'
import { Expand } from 'arx-convert/utils'
import { Settings } from '@src/Settings.js'
import { Locales, toArxLocale } from '@src/Translations.js'

export type AudioType = `speech/${Locales}` | 'sfx'

type AudioConstructorProps = {
  filename: string
  isNative?: boolean
  sourcePath?: string
  /**
   * default value is "sfx"
   */
  type?: AudioType
  /**
   * default value is false
   */
  isInternalAsset?: boolean
}

export class Audio {
  static replacements: Record<string, Audio> = {}

  filename: string
  isNative: boolean
  sourcePath?: string
  type: AudioType
  isInternalAsset: boolean

  constructor(props: AudioConstructorProps) {
    this.filename = props.filename
    if (!this.filename.toLowerCase().endsWith('.wav')) {
      this.filename += '.wav'
    }
    this.isNative = props.isNative ?? true
    this.sourcePath = props.sourcePath
    this.type = props.type ?? 'sfx'
    this.isInternalAsset = props.isInternalAsset ?? false
  }

  clone() {
    return new Audio({
      filename: this.filename,
      isNative: this.isNative,
      sourcePath: this.sourcePath,
      type: this.type,
      isInternalAsset: this.isInternalAsset,
    })
  }

  static fromCustomFile(props: Expand<Omit<AudioConstructorProps, 'isNative'>>) {
    return new Audio({
      ...props,
      isNative: false,
    })
  }

  exportSourceAndTarget(settings: Settings): [string, string] {
    if (this.isNative) {
      throw new Error('trying to export a native Audio')
    }

    const targetPath = this.type === 'sfx' ? 'sfx' : 'speech/' + toArxLocale(this.type.split('/')[1] as Locales)

    const source = path.resolve(
      this.isInternalAsset ? settings.internalAssetsDir : settings.assetsDir,
      this.sourcePath ?? targetPath,
      this.filename,
    )
    const target = path.resolve(settings.outputDir, targetPath, this.filename)

    return [source, target]
  }

  static replace(from: Audio, to: Audio) {
    if (!from.isNative) {
      throw new Error('you can only replace native audio files')
    }

    if (to.isNative) {
      throw new Error('you can only replace audio files with custom audio files')
    }

    this.replacements[from.filename] = to
  }

  static mute(sound: Audio) {
    this.replace(
      sound,
      Audio.fromCustomFile({
        filename: 'no-sound.wav',
        sourcePath: 'reset',
        isInternalAsset: true,
      }),
    )
  }

  static exportReplacements(settings: Settings, type: AudioType = 'sfx') {
    const pairs: Record<string, string> = {}

    for (const key in this.replacements) {
      const [source] = this.replacements[key].exportSourceAndTarget(settings)
      const target = path.resolve(settings.outputDir, type, key)
      pairs[target] = source
    }

    return pairs
  }

  // ----------------

  static get spiderStep3() {
    return new Audio({ filename: 'spider_step3' })
  }
  static get metalOnWood2() {
    return new Audio({ filename: 'metal_on_wood_2' })
  }
  static get sausageJump() {
    return new Audio({ filename: 'sausage_jump' })
  }
  static get footstepShoeMetalStep() {
    return new Audio({ filename: 'footstep_shoe_metal_step' })
  }
  static get interfaceInvstd() {
    return new Audio({ filename: 'interface_invstd' })
  }
  static get clothOnCloth1() {
    return new Audio({ filename: 'cloth_on_cloth_1' })
  }
  static get lever() {
    return new Audio({ filename: 'lever' })
  }
  static get system() {
    return new Audio({ filename: 'system' })
  }
  static get system2() {
    return new Audio({ filename: 'system2' })
  }
  static get system3() {
    return new Audio({ filename: 'system3' })
  }
}
