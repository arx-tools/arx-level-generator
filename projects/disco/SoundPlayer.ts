import { Audio } from '@src/Audio.js'
import { EntityConstructorPropsWithoutSrc } from '@src/Entity.js'
import { Marker } from '@prefabs/entity/Marker.js'
import { Sound, SoundFlags } from '@scripting/classes/Sound.js'

type SoundPlayerConstructorProps = EntityConstructorPropsWithoutSrc & {
  audio: Audio
}

export class SoundPlayer extends Marker {
  constructor({ audio, ...props }: SoundPlayerConstructorProps) {
    super(props)
    this.withScript()

    const sound = new Sound(audio.filename, SoundFlags.EmitFromPlayer)

    this.script?.on('play', () => sound.play())
  }
}
