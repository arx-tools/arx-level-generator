import path from 'node:path'
import { type ArxKey, ArxSettingFlag, type ArxTrack, ArxTrackFlags } from 'arx-convert/types'
import type { Audio } from '@src/Audio.js'
import type { Settings } from '@src/Settings.js'
import type { SingleFileExport } from '@src/types.js'

type AmbienceTrackConstructorProps = {
  filename: string
  sourcePath?: string
  flags?: ArxTrackFlags
}

export class AmbienceTrack {
  static readonly targetPath = 'sfx/ambiance'

  /**
   * @throws Error when `audio` is not a custom sound file
   */
  static fromAudio(audio: Audio): AmbienceTrack {
    if (audio.isNative) {
      throw new Error(`AmbienceTrack: using a builtin Audio "${audio.filename}" is not supported`)
    }

    return new AmbienceTrack({
      filename: audio.filename,
      sourcePath: audio.sourcePath,
      flags: ArxTrackFlags.Master,
    })
  }

  filename: string
  sourcePath?: string
  flags: ArxTrackFlags
  keys: ArxKey[]

  constructor(props: AmbienceTrackConstructorProps) {
    this.filename = props.filename
    this.sourcePath = props.sourcePath
    this.flags = props.flags ?? ArxTrackFlags.None

    // TODO: turn this into a class maybe?
    const key: ArxKey = {
      start: 0,
      loop: 1,
      delayMin: 0,
      delayMax: 0,
      volume: { min: 1, max: 1, interval: 0, flags: ArxSettingFlag.None },
      pitch: { min: 1, max: 1, interval: 0, flags: ArxSettingFlag.None },
      pan: { min: 0, max: 0, interval: 0, flags: ArxSettingFlag.None },
      x: { min: 0, max: 0, interval: 0, flags: ArxSettingFlag.None },
      y: { min: 0, max: 0, interval: 0, flags: ArxSettingFlag.None },
      z: { min: 0, max: 0, interval: 0, flags: ArxSettingFlag.None },
    }

    this.keys = [key]
  }

  exportSourceAndTarget(settings: Settings): SingleFileExport {
    const source = path.resolve(settings.assetsDir, this.sourcePath ?? AmbienceTrack.targetPath, this.filename)
    const target = path.resolve(settings.outputDir, `${AmbienceTrack.targetPath}/${this.filename}`)

    return [source, target]
  }

  toArxTrack(): ArxTrack {
    return {
      filename: `${AmbienceTrack.targetPath}/${this.filename}`,
      flags: this.flags,
      keys: this.keys,
    }
  }
}
