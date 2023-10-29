import { Variable } from '@scripting/properties/Variable.js'

export enum SoundFlags {
  None = 0,
  EmitFromPlayer = 1 << 0,
  Loop = 1 << 1,
  Unique = 1 << 2,
  VaryPitch = 1 << 3,
}

export class Sound {
  filename: string | Variable<string>
  flags: SoundFlags

  /**
   * Don't forget to add the audio to an entity's otherDependencies if you are
   * using custom files
   */
  constructor(filename: string | Variable<string>, flags: SoundFlags = SoundFlags.None) {
    this.filename = filename
    this.flags = flags
  }

  play() {
    const flags = this.stringifyFlags()
    const filename = this.getFilename()
    return `play ${flags} ${filename}`
  }

  /**
   * only works if the sound has the unique flag
   * @see SoundFlags.Unique
   */
  stop() {
    const flags = '-s'
    const filename = this.getFilename()
    return `play ${flags} ${filename}`
  }

  private getFilename() {
    if (typeof this.filename === 'string') {
      return '"' + this.filename + '"'
    } else {
      return this.filename.name
    }
  }

  /**
   * [o] = emit from player
   * [l] = loop
   * [i] = unique
   * [p] = variable pitch
   * [s] = stop (only if unique)
   */
  private stringifyFlags() {
    let letters = ''

    if (this.flags & SoundFlags.EmitFromPlayer) {
      letters += 'o'
    }
    if (this.flags & SoundFlags.Loop) {
      letters += 'l'
    }
    if (this.flags & SoundFlags.Unique) {
      letters += 'i'
    }
    if (this.flags & SoundFlags.VaryPitch) {
      letters += 'p'
    }

    return (letters === '' ? '' : '-') + letters
  }

  isStoppable() {
    return (this.flags & SoundFlags.Unique) !== 0
  }
}
