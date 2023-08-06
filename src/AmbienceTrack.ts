import path from 'node:path'
import { ArxKey, ArxSettingFlag, ArxTrack, ArxTrackFlags } from 'arx-convert/types'
import { Audio } from '@src/Audio.js'

type AmbienceTrackConstructorProps = {
  filename: string
  sourcePath?: string
  flags?: ArxTrackFlags
}

export class AmbienceTrack {
  static targetPath = 'sfx/ambiance'
  filename: string
  sourcePath?: string
  flags: ArxTrackFlags
  keys: ArxKey[]

  constructor(props: AmbienceTrackConstructorProps) {
    this.filename = props.filename
    this.sourcePath = props.sourcePath
    this.flags = props.flags ?? ArxTrackFlags.None

    // TODO: turn this into a class maybe?
    this.keys = [
      {
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
      },
    ]
  }

  static fromAudio(audio: Audio) {
    if (audio.isNative) {
      throw new Error(`AmbienceTrack: using a native Audio "${audio.filename}" is not supported (yet?)`)
    }

    return new AmbienceTrack({
      filename: audio.filename,
      sourcePath: audio.sourcePath,
      flags: ArxTrackFlags.Master,
    })
  }

  exportSourceAndTarget(outputDir: string): [string, string] {
    const source = path.resolve('assets', this.sourcePath ?? AmbienceTrack.targetPath, this.filename)
    const target = path.resolve(outputDir, AmbienceTrack.targetPath, this.filename)

    return [source, target]
  }

  toArxTrack(): ArxTrack {
    return {
      filename: AmbienceTrack.targetPath + '/' + this.filename,
      flags: this.flags,
      keys: this.keys,
    }
  }
}
