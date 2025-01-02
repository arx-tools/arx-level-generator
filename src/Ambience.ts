import path from 'node:path'
import { type ArxAMB } from 'arx-convert/types'
import { AmbienceTrack } from '@src/AmbienceTrack.js'
import { type Audio } from '@src/Audio.js'
import { type ISettings } from '@platform/common/ISettings.js'
import { ExportBuiltinAssetError } from '@src/errors.js'
import { type FileExports } from '@src/types.js'

type AmbienceConstructorProps = {
  name: string
  volume?: number
  isNative?: boolean
  tracks?: AmbienceTrack[]
}

export class Ambience {
  static targetPath = 'sfx/ambiance'

  static fromAudio(ambienceName: string, audio: Audio): Ambience {
    return new Ambience({
      name: ambienceName,
      isNative: false,
      tracks: [AmbienceTrack.fromAudio(audio)],
    })
  }

  // ----------------

  static get none(): Ambience {
    return new Ambience({ name: 'none' })
  }

  static get blackThing(): Ambience {
    return new Ambience({ name: 'ambient_blackthing' })
  }

  static get bunkerAkbaa(): Ambience {
    return new Ambience({ name: 'ambient_bunker_akbaa' })
  }

  static get bunker(): Ambience {
    return new Ambience({ name: 'ambient_bunker' })
  }

  static get castle(): Ambience {
    return new Ambience({ name: 'ambient_castle' })
  }

  static get caveA(): Ambience {
    return new Ambience({ name: 'ambient_cave_a' })
  }

  static get caveB(): Ambience {
    return new Ambience({ name: 'ambient_cave_b' })
  }

  static get caveFrozen(): Ambience {
    return new Ambience({ name: 'ambient_cave_frozen' })
  }

  static get caveGreu(): Ambience {
    return new Ambience({ name: 'ambient_cave_greu' })
  }

  static get caveLava(): Ambience {
    return new Ambience({ name: 'ambient_cave_lava' })
  }

  static get caveWorm(): Ambience {
    return new Ambience({ name: 'ambient_cave_worm' })
  }

  static get credits(): Ambience {
    return new Ambience({ name: 'ambient_credits' })
  }

  static get cryptA(): Ambience {
    return new Ambience({ name: 'ambient_crypt_a' })
  }

  static get cryptB(): Ambience {
    return new Ambience({ name: 'ambient_crypt_b' })
  }

  static get cryptC(): Ambience {
    return new Ambience({ name: 'ambient_crypt_c' })
  }

  static get cryptD(): Ambience {
    return new Ambience({ name: 'ambient_crypt_d' })
  }

  static get cryptE(): Ambience {
    return new Ambience({ name: 'ambient_crypt_e' })
  }

  static get cryptF(): Ambience {
    return new Ambience({ name: 'ambient_crypt_f' })
  }

  static get cryptLich(): Ambience {
    return new Ambience({ name: 'ambient_crypt_lich' })
  }

  static get dramatic(): Ambience {
    return new Ambience({ name: 'ambient_dramatic' })
  }

  static get dwarf(): Ambience {
    return new Ambience({ name: 'ambient_dwarf' })
  }

  static get fight(): Ambience {
    return new Ambience({ name: 'ambient_fight' })
  }

  static get fightMusic(): Ambience {
    return new Ambience({ name: 'ambient_fight_music' })
  }

  static get gobCastle(): Ambience {
    return new Ambience({ name: 'ambient_gob_castle' })
  }

  static get gobIntro(): Ambience {
    return new Ambience({ name: 'ambient_gob_intro' })
  }

  static get jailMain(): Ambience {
    return new Ambience({ name: 'ambient_gob_jail_main' })
  }

  static get jailStress(): Ambience {
    return new Ambience({ name: 'ambient_gob_jail_stress' })
  }

  static get gobRuin(): Ambience {
    return new Ambience({ name: 'ambient_gob_ruin' })
  }

  static get importantPlace(): Ambience {
    return new Ambience({ name: 'Ambient_important_place' })
  }

  static get introA(): Ambience {
    return new Ambience({ name: 'ambient_intro_a' })
  }

  static get intro(): Ambience {
    return new Ambience({ name: 'ambient_intro' })
  }

  static get introB(): Ambience {
    return new Ambience({ name: 'ambient_intro_b' })
  }

  static get menu(): Ambience {
    return new Ambience({ name: 'ambient_menu' })
  }

  static get noden(): Ambience {
    return new Ambience({ name: 'ambient_noden' })
  }

  static get outpost(): Ambience {
    return new Ambience({ name: 'ambient_outpost' })
  }

  static get rebelsCool(): Ambience {
    return new Ambience({ name: 'ambient_rebels_cool' })
  }

  static get rebelsIntense(): Ambience {
    return new Ambience({ name: 'ambient_rebels_intense' })
  }

  static get snakeCastle(): Ambience {
    return new Ambience({ name: 'ambient_snake_castle' })
  }

  static get snakeIllusion(): Ambience {
    return new Ambience({ name: 'ambient_snake_illusion' })
  }

  static get tavern(): Ambience {
    return new Ambience({ name: 'ambient_tavern' })
  }

  static get templeAkbaa(): Ambience {
    return new Ambience({ name: 'ambient_temple_akbaa' })
  }

  static get templeAkbaaUp(): Ambience {
    return new Ambience({ name: 'ambient_temple_akbaa_up' })
  }

  static get town(): Ambience {
    return new Ambience({ name: 'ambient_town' })
  }

  static get troll(): Ambience {
    return new Ambience({ name: 'ambient_troll' })
  }

  static get reverbTest(): Ambience {
    return new Ambience({ name: 'reverb_test' })
  }

  static get stress(): Ambience {
    return new Ambience({ name: 'stress' })
  }

  // ----------------

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

  clone(): Ambience {
    return new Ambience({
      name: this.name,
      volume: this.volume,
      isNative: this.isNative,
      tracks: this.tracks,
    })
  }

  /**
   * @throws ExportBuiltinAssetError when trying to export an Audio that's built into the base game
   */
  exportSourcesAndTargets(settings: ISettings): FileExports {
    if (this.isNative) {
      throw new ExportBuiltinAssetError()
    }

    let results: FileExports = {}

    for (const track of this.tracks) {
      results = {
        ...results,
        ...track.exportSourceAndTarget(settings),
      }
    }

    return results
  }

  toArxData(settings: ISettings): Record<string, ArxAMB> {
    const target = path.resolve(settings.outputDir, Ambience.targetPath, `${this.name}.amb.json`)

    return {
      [target]: {
        tracks: this.tracks.map((track) => {
          return track.toArxData()
        }),
      },
    }
  }
}
