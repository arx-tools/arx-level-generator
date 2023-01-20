import { ArxAMB, ArxTrackFlags } from 'arx-convert/types'
import path from 'node:path'
import { AmbienceTrack } from '@src/AmbienceTrack'

type AmbienceConstructorProps = {
  name: string
  volume?: number
  isNative?: boolean
  tracks?: AmbienceTrack[]
}

export class Ambience {
  static targetPath = 'sfx/ambiance'

  name: string
  volume: number
  isNative: boolean
  tracks: AmbienceTrack[]

  constructor(props: AmbienceConstructorProps) {
    this.name = props.name
    this.volume = props.volume ?? 100
    this.isNative = props.isNative ?? true
    this.tracks = props.tracks ?? []
  }

  clone() {
    return new Ambience({
      name: this.name,
      volume: this.volume,
      isNative: this.isNative,
      tracks: this.tracks,
    })
  }

  static fromCustomAudio(ambienceName: string, filename: string, sourcePath?: string) {
    const track = new AmbienceTrack({
      filename,
      sourcePath,
      flags: ArxTrackFlags.Master,
    })

    return new Ambience({
      name: ambienceName,
      isNative: false,
      tracks: [track],
    })
  }

  exportSourcesAndTargets(outputDir: string) {
    if (this.isNative) {
      throw new Error('trying to export copying information for a native Ambience')
    }

    const results: [string, string][] = []

    for (let track of this.tracks) {
      results.push(track.exportSourceAndTarget(outputDir))
    }

    return results
  }

  toArxData(outputDir: string): Record<string, ArxAMB> {
    const target = path.resolve(outputDir, Ambience.targetPath, `${this.name}.amb.json`)

    return {
      [target]: {
        tracks: this.tracks.map((track) => track.toArxTrack()),
      },
    }
  }

  // ----------------

  static get none() {
    return new Ambience({ name: 'none' })
  }
  static get blackThing() {
    return new Ambience({ name: 'ambient_blackthing' })
  }
  static get bunkerAkbaa() {
    return new Ambience({ name: 'ambient_bunker_akbaa' })
  }
  static get bunker() {
    return new Ambience({ name: 'ambient_bunker' })
  }
  static get castle() {
    return new Ambience({ name: 'ambient_castle' })
  }
  static get caveA() {
    return new Ambience({ name: 'ambient_cave_a' })
  }
  static get caveB() {
    return new Ambience({ name: 'ambient_cave_b' })
  }
  static get caveFrozen() {
    return new Ambience({ name: 'ambient_cave_frozen' })
  }
  static get caveGreu() {
    return new Ambience({ name: 'ambient_cave_greu' })
  }
  static get caveLava() {
    return new Ambience({ name: 'ambient_cave_lava' })
  }
  static get caveWorm() {
    return new Ambience({ name: 'ambient_cave_worm' })
  }
  static get credits() {
    return new Ambience({ name: 'ambient_credits' })
  }
  static get cryptA() {
    return new Ambience({ name: 'ambient_crypt_a' })
  }
  static get cryptB() {
    return new Ambience({ name: 'ambient_crypt_b' })
  }
  static get cryptC() {
    return new Ambience({ name: 'ambient_crypt_c' })
  }
  static get cryptD() {
    return new Ambience({ name: 'ambient_crypt_d' })
  }
  static get cryptE() {
    return new Ambience({ name: 'ambient_crypt_e' })
  }
  static get cryptF() {
    return new Ambience({ name: 'ambient_crypt_f' })
  }
  static get cryptLich() {
    return new Ambience({ name: 'ambient_crypt_lich' })
  }
  static get dramatic() {
    return new Ambience({ name: 'ambient_dramatic' })
  }
  static get dwarf() {
    return new Ambience({ name: 'ambient_dwarf' })
  }
  static get fight() {
    return new Ambience({ name: 'ambient_fight' })
  }
  static get fightMusic() {
    return new Ambience({ name: 'ambient_fight_music' })
  }
  static get gobCastle() {
    return new Ambience({ name: 'ambient_gob_castle' })
  }
  static get gobIntro() {
    return new Ambience({ name: 'ambient_gob_intro' })
  }
  static get jailMain() {
    return new Ambience({ name: 'ambient_gob_jail_main' })
  }
  static get jailStress() {
    return new Ambience({ name: 'ambient_gob_jail_stress' })
  }
  static get gobRuin() {
    return new Ambience({ name: 'ambient_gob_ruin' })
  }
  static get importantPlace() {
    return new Ambience({ name: 'Ambient_important_place' })
  }
  static get introA() {
    return new Ambience({ name: 'ambient_intro_a' })
  }
  static get intro() {
    return new Ambience({ name: 'ambient_intro' })
  }
  static get introB() {
    return new Ambience({ name: 'ambient_intro_b' })
  }
  static get menu() {
    return new Ambience({ name: 'ambient_menu' })
  }
  static get noden() {
    return new Ambience({ name: 'ambient_noden' })
  }
  static get outpost() {
    return new Ambience({ name: 'ambient_outpost' })
  }
  static get rebelsCool() {
    return new Ambience({ name: 'ambient_rebels_cool' })
  }
  static get rebelsIntense() {
    return new Ambience({ name: 'ambient_rebels_intense' })
  }
  static get snakeCastle() {
    return new Ambience({ name: 'ambient_snake_castle' })
  }
  static get snakeIllusion() {
    return new Ambience({ name: 'ambient_snake_illusion' })
  }
  static get tavern() {
    return new Ambience({ name: 'ambient_tavern' })
  }
  static get templeAkbaa() {
    return new Ambience({ name: 'ambient_temple_akbaa' })
  }
  static get templeAkbaaUp() {
    return new Ambience({ name: 'ambient_temple_akbaa_up' })
  }
  static get town() {
    return new Ambience({ name: 'ambient_town' })
  }
  static get troll() {
    return new Ambience({ name: 'ambient_troll' })
  }
  static get reverbTest() {
    return new Ambience({ name: 'reverb_test' })
  }
  static get stress() {
    return new Ambience({ name: 'stress' })
  }
}
