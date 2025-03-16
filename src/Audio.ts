import type { Settings } from '@platform/common/Settings.js'
import { type Locales, toArxLocale } from '@src/Translations.js'
import { ExportBuiltinAssetError } from '@src/errors.js'
import type { FileExports } from '@src/types.js'
import { joinPath } from '@src/helpers.js'
import type { Simplify } from 'type-fest'

export type AudioType = `speech/${Locales}` | 'sfx'

type AudioConstructorProps = {
  filename: string
  /**
   * default value is true, except when class is initialized via fromCustomFile -> in that case it's false
   */
  isNative?: boolean
  /**
   * default values is based on the value of the type property: if type not defined, then sourcePath defaults to "sfx"
   */
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

abstract class _Audio {
  abstract exportSourceAndTarget(settings: Settings): FileExports
}

export class Audio extends _Audio {
  static replacements: Record<string, _Audio> = {}

  static fromCustomFile(props: Simplify<Omit<AudioConstructorProps, 'isNative'>>): Audio {
    return new Audio({
      ...props,
      isNative: false,
    })
  }

  /**
   * Overrides an builtin game audio with a custom audio file
   *
   * @param {Audio} from a builtin audio
   * @param {Audio} to a custom audio file
   *
   * @throws Error when either `from` is not a builtin audio or `to` is not a custom audio file
   */
  static replace(from: Audio, to: Audio): void {
    if (!from.isNative) {
      throw new Error('you can only replace native audio files')
    }

    if (to.isNative) {
      throw new Error('you can only replace audio files with custom audio files')
    }

    this.replacements[from.filename] = to
  }

  static mute(sound: Audio): void {
    this.replace(
      sound,
      Audio.fromCustomFile({
        filename: 'no-sound.wav',
        sourcePath: 'reset',
        isInternalAsset: true,
      }),
    )
  }

  static exportReplacements(settings: Settings, type: AudioType = 'sfx'): FileExports {
    const pairs: FileExports = {}

    for (const key in this.replacements) {
      const source = Object.values(this.replacements[key].exportSourceAndTarget(settings))[0]
      pairs[`${type}/${key}`] = source
    }

    return pairs
  }

  // ----------------

  static get spiderStep3(): Audio {
    return new Audio({ filename: 'spider_step3' })
  }

  static get metalOnWood2(): Audio {
    return new Audio({ filename: 'metal_on_wood_2' })
  }

  static get sausageJump(): Audio {
    return new Audio({ filename: 'sausage_jump' })
  }

  static get footstepShoeMetalStep(): Audio {
    return new Audio({ filename: 'footstep_shoe_metal_step' })
  }

  static get interfaceInvstd(): Audio {
    return new Audio({ filename: 'interface_invstd' })
  }

  static get clothOnCloth1(): Audio {
    return new Audio({ filename: 'cloth_on_cloth_1' })
  }

  static get lever(): Audio {
    return new Audio({ filename: 'lever' })
  }

  static get system(): Audio {
    return new Audio({ filename: 'system' })
  }

  static get system2(): Audio {
    return new Audio({ filename: 'system2' })
  }

  static get system3(): Audio {
    return new Audio({ filename: 'system3' })
  }

  // ----------------

  filename: string
  isNative: boolean
  sourcePath?: string
  type: AudioType
  isInternalAsset: boolean

  constructor(props: AudioConstructorProps) {
    super()

    this.filename = props.filename
    if (!this.filename.toLowerCase().endsWith('.wav')) {
      this.filename = this.filename + '.wav'
    }

    this.isNative = props.isNative ?? true
    this.sourcePath = props.sourcePath
    this.type = props.type ?? 'sfx'
    this.isInternalAsset = props.isInternalAsset ?? false
  }

  clone(): Audio {
    return new Audio({
      filename: this.filename,
      isNative: this.isNative,
      sourcePath: this.sourcePath,
      type: this.type,
      isInternalAsset: this.isInternalAsset,
    })
  }

  /**
   * @throws ExportBuiltinAssetError when trying to export an Audio that's built into the base game
   */
  exportSourceAndTarget(settings: Settings): FileExports {
    if (this.isNative) {
      throw new ExportBuiltinAssetError()
    }

    let targetPath: string
    if (this.type === 'sfx') {
      targetPath = 'sfx'
    } else {
      targetPath = 'speech/' + toArxLocale(this.type.split('/')[1] as Locales)
    }

    let source: string
    if (this.isInternalAsset) {
      source = joinPath(settings.internalAssetsDir, this.sourcePath ?? targetPath, this.filename)
    } else {
      source = joinPath(this.sourcePath ?? targetPath, this.filename)
    }

    const target = joinPath(targetPath, this.filename)

    return {
      [target]: source,
    }
  }
}
