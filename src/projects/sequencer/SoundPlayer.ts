import { Marker } from '@prefabs/entity/Marker.js'
import { EntityConstructorPropsWithoutSrc } from '@src/Entity.js'

type SoundPlayerConstructorProps = EntityConstructorPropsWithoutSrc & {
  filename: string
}

export class SoundPlayer extends Marker {
  constructor(props: SoundPlayerConstructorProps) {
    super(props)
    this.withScript()
    this.script?.on('play', () => {
      return `play -o ${props.filename}`
    })
  }
}
