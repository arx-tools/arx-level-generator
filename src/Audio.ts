import path from 'node:path'
import { Expand } from 'arx-convert/utils'

export type AudioType = 'speech' | 'sfx'

type AudioConstructorProps = {
  filename: string
  isNative?: boolean
  sourcePath?: string
  /**
   * @default "sfx"
   */
  type?: AudioType
}

export class Audio {
  static replacements: Record<string, Audio> = {}

  filename: string
  isNative: boolean
  sourcePath?: string
  targetPath: string

  constructor(props: AudioConstructorProps) {
    this.filename = props.filename
    this.isNative = props.isNative ?? true
    this.sourcePath = props.sourcePath
    // TODO: find a way to support other languages too, not just english
    this.targetPath = props.type === 'speech' ? 'speech/english' : 'sfx'
  }

  static async fromCustomFile(props: Expand<Omit<AudioConstructorProps, 'isNative'>>) {
    return new Audio({
      ...props,
      isNative: false,
    })
  }

  async exportSourceAndTarget(outputDir: string) {
    if (this.isNative) {
      throw new Error('trying to export a native Audio')
    }

    const source = path.resolve('assets', this.sourcePath ?? this.targetPath, this.filename)
    const target = path.resolve(outputDir, this.targetPath, this.filename)

    return [source, target]
  }

  static async replace(from: Audio, to: Audio | Promise<Audio>) {
    if (!from.isNative) {
      throw new Error('you can only replace native audio files')
    }

    if ((await to).isNative) {
      throw new Error('you can only replace audio files with a custom audio file')
    }

    this.replacements[from.filename] = await to
  }

  static async mute(sound: Audio) {
    this.replace(
      sound,
      Audio.fromCustomFile({
        filename: 'no-sound.wav',
        sourcePath: 'reset',
      }),
    )
  }

  static async exportReplacements(outputDir: string, type: AudioType = 'sfx') {
    const pairs: Record<string, string> = {}

    for (let key in this.replacements) {
      const [source] = await this.replacements[key].exportSourceAndTarget(outputDir)
      const target = path.resolve(outputDir, type, key)
      pairs[target] = source
    }

    return pairs
  }

  // ----------------

  static get spiderStep3() {
    return new Audio({ filename: 'spider_step3.wav' })
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
    return new Audio({ filename: 'lever.wav' })
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
