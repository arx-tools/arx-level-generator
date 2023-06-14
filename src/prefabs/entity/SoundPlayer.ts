import { Expand } from 'arx-convert/utils'
import { Audio } from '@src/Audio.js'
import { EntityConstructorPropsWithoutSrc } from '@src/Entity.js'
import { Marker } from '@prefabs/entity/Marker.js'
import { Sound, SoundFlags } from '@scripting/classes/Sound.js'

type SoundPlayerConstructorProps = Expand<
  EntityConstructorPropsWithoutSrc & {
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
>

export class SoundPlayer extends Marker {
  readonly autoplay: boolean
  private sound: Sound

  constructor({ audio, flags = SoundFlags.EmitFromPlayer, autoplay = false, ...props }: SoundPlayerConstructorProps) {
    super(props)
    this.withScript()

    this.autoplay = autoplay
    this.sound = new Sound(audio.filename, flags)

    this.otherDependencies.push(audio)

    if (this.autoplay) {
      this.script?.on('init', () => this.sound.play())
    }

    if (!autoplay || this.sound.isStoppable()) {
      this.script?.on('play', () => this.sound.play())
    }

    if (this.sound.isStoppable()) {
      this.script?.on('stop', () => this.sound.stop())
    }
  }

  on() {
    if (this.autoplay && !this.sound.isStoppable()) {
      console.warn(
        `Attempting to trigger play event on "${this.sound.filename}" in SoundPlayer that is on autoplay, but not unique (can't be stopped)`,
      )
      return ''
    }

    return `sendevent play ${this.ref} nop`
  }

  off() {
    if (!this.sound.isStoppable()) {
      console.warn(`Attempting to trigger stop event on "${this.sound.filename}" in SoundPlayer which is not stoppable`)
      return ''
    }

    return `sendevent stop ${this.ref} nop`
  }
}
