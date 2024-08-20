import { type Expand } from 'arx-convert/utils'
import { type Audio } from '@src/Audio.js'
import { type EntityConstructorPropsWithoutSrc } from '@src/Entity.js'
import { Marker } from '@prefabs/entity/Marker.js'
import { Sound, SoundFlags } from '@scripting/classes/Sound.js'

type SoundPlayerConstructorProps = Expand<
  EntityConstructorPropsWithoutSrc & {
    audio: Audio
    /**
     * default value is SoundFlags.EmitFromPlayer
     */
    flags?: SoundFlags
    /**
     * default value is false
     */
    autoplay?: boolean
  }
>

export class SoundPlayer extends Marker {
  readonly autoplay: boolean
  private readonly sound: Sound

  constructor({ audio, flags = SoundFlags.EmitFromPlayer, autoplay = false, ...props }: SoundPlayerConstructorProps) {
    super(props)
    this.withScript()

    this.autoplay = autoplay
    this.sound = new Sound(audio.filename, flags)

    this.otherDependencies.push(audio)

    if (this.autoplay) {
      this.script?.on('init', () => {
        return this.sound.play()
      })
    }

    if (!autoplay || this.sound.isStoppable()) {
      this.script?.on('play', () => {
        return this.sound.play()
      })
    }

    if (this.sound.isStoppable()) {
      this.script?.on('stop', () => {
        return this.sound.stop()
      })
    }
  }

  on(): string {
    if (this.autoplay && !this.sound.isStoppable()) {
      console.warn(
        `[warning] SoundPlayer: Attempting to trigger play event on "${this.sound.filename.toString()}" in SoundPlayer that is on autoplay, but not unique (can't be stopped)`,
      )
      return ''
    }

    return `sendevent play ${this.ref} nop`
  }

  off(): string {
    if (!this.sound.isStoppable()) {
      console.warn(
        `[warning] SoundPlayer: Attempting to trigger stop event on "${this.sound.filename.toString()}" in SoundPlayer which is not stoppable`,
      )
      return ''
    }

    return `sendevent stop ${this.ref} nop`
  }
}
