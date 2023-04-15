import { Marker } from '@prefabs/entity/Marker.js'
import { Sound, SoundFlags } from '@scripting/classes/Sound.js'
import { EntityConstructorPropsWithoutSrc } from '@src/Entity.js'

type SoundPlayerConstructorProps = EntityConstructorPropsWithoutSrc & {
  filename: string
}

export class SoundPlayer extends Marker {
  constructor({ filename, ...props }: SoundPlayerConstructorProps) {
    super(props)
    this.withScript()

    const sound = new Sound(filename, SoundFlags.EmitFromPlayer)

    this.script?.on('play', () => sound.play())
  }
}
