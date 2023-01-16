import path from 'node:path'
import { ArxSettingFlag, ArxTrack, ArxTrackFlags } from 'arx-convert/types'

type AmbienceConstructorProps = {
  name: string
  volume?: number
  isNative?: boolean
  tracks?: (ArxTrack & { sourcePath?: string })[]
}

export class Ambience {
  static targetPath = 'sfx/ambiance'

  name: string
  volume: number
  isNative: boolean
  tracks: (ArxTrack & { sourcePath?: string })[]

  static blackThing = Object.freeze(new Ambience({ name: 'ambient_blackthing' }))
  static bunkerAkbaa = Object.freeze(new Ambience({ name: 'ambient_bunker_akbaa' }))
  static bunker = Object.freeze(new Ambience({ name: 'ambient_bunker' }))
  static castle = Object.freeze(new Ambience({ name: 'ambient_castle' }))
  static caveA = Object.freeze(new Ambience({ name: 'ambient_cave_a' }))
  static caveB = Object.freeze(new Ambience({ name: 'ambient_cave_b' }))
  static caveFrozen = Object.freeze(new Ambience({ name: 'ambient_cave_frozen' }))
  static caveGreu = Object.freeze(new Ambience({ name: 'ambient_cave_greu' }))
  static caveLava = Object.freeze(new Ambience({ name: 'ambient_cave_lava' }))
  static caveWorm = Object.freeze(new Ambience({ name: 'ambient_cave_worm' }))
  static credits = Object.freeze(new Ambience({ name: 'ambient_credits' }))
  static cryptA = Object.freeze(new Ambience({ name: 'ambient_crypt_a' }))
  static cryptB = Object.freeze(new Ambience({ name: 'ambient_crypt_b' }))
  static cryptC = Object.freeze(new Ambience({ name: 'ambient_crypt_c' }))
  static cryptD = Object.freeze(new Ambience({ name: 'ambient_crypt_d' }))
  static cryptE = Object.freeze(new Ambience({ name: 'ambient_crypt_e' }))
  static cryptF = Object.freeze(new Ambience({ name: 'ambient_crypt_f' }))
  static cryptLich = Object.freeze(new Ambience({ name: 'ambient_crypt_lich' }))
  static dramatic = Object.freeze(new Ambience({ name: 'ambient_dramatic' }))
  static dwarf = Object.freeze(new Ambience({ name: 'ambient_dwarf' }))
  static fight = Object.freeze(new Ambience({ name: 'ambient_fight' }))
  static fightMusic = Object.freeze(new Ambience({ name: 'ambient_fight_music' }))
  static gobCastle = Object.freeze(new Ambience({ name: 'ambient_gob_castle' }))
  static gobIntro = Object.freeze(new Ambience({ name: 'ambient_gob_intro' }))
  static jailMain = Object.freeze(new Ambience({ name: 'ambient_gob_jail_main' }))
  static jailStress = Object.freeze(new Ambience({ name: 'ambient_gob_jail_stress' }))
  static gobRuin = Object.freeze(new Ambience({ name: 'ambient_gob_ruin' }))
  static importantPlace = Object.freeze(new Ambience({ name: 'Ambient_important_place' }))
  static introA = Object.freeze(new Ambience({ name: 'ambient_intro_a' }))
  static intro = Object.freeze(new Ambience({ name: 'ambient_intro' }))
  static introB = Object.freeze(new Ambience({ name: 'ambient_intro_b' }))
  static menu = Object.freeze(new Ambience({ name: 'ambient_menu' }))
  static noden = Object.freeze(new Ambience({ name: 'ambient_noden' }))
  static outpost = Object.freeze(new Ambience({ name: 'ambient_outpost' }))
  static rebelsCool = Object.freeze(new Ambience({ name: 'ambient_rebels_cool' }))
  static rebelsIntense = Object.freeze(new Ambience({ name: 'ambient_rebels_intense' }))
  static snakeCastle = Object.freeze(new Ambience({ name: 'ambient_snake_castle' }))
  static snakeIllusion = Object.freeze(new Ambience({ name: 'ambient_snake_illusion' }))
  static tavern = Object.freeze(new Ambience({ name: 'ambient_tavern' }))
  static templeAkbaa = Object.freeze(new Ambience({ name: 'ambient_temple_akbaa' }))
  static templeAkbaaUp = Object.freeze(new Ambience({ name: 'ambient_temple_akbaa_up' }))
  static town = Object.freeze(new Ambience({ name: 'ambient_town' }))
  static troll = Object.freeze(new Ambience({ name: 'ambient_troll' }))
  static reverbTest = Object.freeze(new Ambience({ name: 'reverb_test' }))
  static stress = Object.freeze(new Ambience({ name: 'stress' }))

  constructor(props: AmbienceConstructorProps) {
    this.name = props.name
    this.volume = props.volume ?? 100
    this.isNative = props.isNative ?? true
    this.tracks = props.tracks ?? []
  }

  setVolume(volume: number) {
    return new Ambience({
      name: this.name,
      volume,
      isNative: this.isNative,
      tracks: this.tracks,
    })
  }

  // TODO: move this to a separate Track class
  static fromCustomAudio(ambienceName: string, filename: string, sourcePath?: string) {
    const track = {
      filename,
      sourcePath,
      flags: ArxTrackFlags.Master,
      keys: [
        {
          start: 0,
          loop: 4,
          delayMin: 0,
          delayMax: 0,
          volume: { min: 0.9, max: 1, interval: 0, flags: ArxSettingFlag.None },
          pitch: { min: 1, max: 1, interval: 0, flags: ArxSettingFlag.None },
          pan: { min: 0, max: 0, interval: 0, flags: ArxSettingFlag.None },
          x: { min: 0, max: 0, interval: 0, flags: ArxSettingFlag.None },
          y: { min: 0, max: 0, interval: 0, flags: ArxSettingFlag.None },
          z: { min: 0, max: 0, interval: 0, flags: ArxSettingFlag.None },
        },
      ],
    }

    return new Ambience({
      name: ambienceName,
      isNative: false,
      tracks: [track],
    })
  }

  // TODO: move this to a separate Track class
  async exportSourceAndTarget(outputDir: string): Promise<[string, string]> {
    if (this.isNative) {
      throw new Error('trying to export copying information for a native Ambience')
    }

    const track = this.tracks[0]
    const source = path.resolve('assets', track.sourcePath ?? Ambience.targetPath, track.filename)
    const target = path.resolve(outputDir, Ambience.targetPath, track.filename)

    return [source, target]
  }
}
