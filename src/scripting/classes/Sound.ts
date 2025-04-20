import type { Variable } from '@scripting/properties/Variable.js'

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

  play(): string {
    const flags = this.stringifyFlags()
    const filename = this.getFilename()
    return `play ${flags} ${filename}`
  }

  /**
   * only works if the sound has the unique flag
   * @see SoundFlags.Unique
   */
  stop(): string {
    const flags = '-s'
    const filename = this.getFilename()
    return `play ${flags} ${filename}`
  }

  isStoppable(): boolean {
    return (this.flags & SoundFlags.Unique) !== 0
  }

  private getFilename(): string {
    if (typeof this.filename === 'string') {
      return '"' + this.filename + '"'
    }

    return this.filename.name
  }

  /**
   * [o] = emit from player
   * [l] = loop
   * [i] = unique
   * [p] = variable pitch
   * [s] = stop (only if unique)
   */
  private stringifyFlags(): string {
    let letters = ''

    if (this.flags & SoundFlags.EmitFromPlayer) {
      letters = letters + 'o'
    }

    if (this.flags & SoundFlags.Loop) {
      letters = letters + 'l'
    }

    if (this.flags & SoundFlags.Unique) {
      letters = letters + 'i'
    }

    if (this.flags & SoundFlags.VaryPitch) {
      letters = letters + 'p'
    }

    if (letters === '') {
      return ''
    }

    return '-' + letters
  }
}
