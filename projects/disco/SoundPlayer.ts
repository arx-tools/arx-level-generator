import { Audio } from '@src/Audio.js'
import { EntityConstructorPropsWithoutSrc } from '@src/Entity.js'
import { Marker } from '@prefabs/entity/Marker.js'
import { Sound, SoundFlags } from '@scripting/classes/Sound.js'

type SoundPlayerConstructorProps = EntityConstructorPropsWithoutSrc & {
  audio: Audio
  /**
   * @default SoundFlags.EmitFromPlayer
   */
  flags?: SoundFlags
  /**
   * @default false
   */
  autoplay?: boolean
}

export class SoundPlayer extends Marker {
  constructor({ audio, flags = SoundFlags.EmitFromPlayer, autoplay = false, ...props }: SoundPlayerConstructorProps) {
    super(props)
    this.withScript()

    this.otherStuff.push(audio)

    const sound = new Sound(audio.filename, flags)

    this.script?.on('play', () => sound.play())

    if (autoplay) {
      this.script?.on('init', () => sound.play())
    }
  }
}
