type AmbienceConstructorProps = {
  src: string
  volume?: number
}

export class Ambience {
  src: string
  volume: number

  static blackThing = Object.freeze(new Ambience({ src: 'ambient_blackthing' }))
  static bunkerAkbaa = Object.freeze(new Ambience({ src: 'ambient_bunker_akbaa' }))
  static bunker = Object.freeze(new Ambience({ src: 'ambient_bunker' }))
  static castle = Object.freeze(new Ambience({ src: 'ambient_castle' }))
  static caveA = Object.freeze(new Ambience({ src: 'ambient_cave_a' }))
  static caveB = Object.freeze(new Ambience({ src: 'ambient_cave_b' }))
  static caveFrozen = Object.freeze(new Ambience({ src: 'ambient_cave_frozen' }))
  /*
  TODO:
  ambient_cave_greu
  ambient_cave_lava
  ambient_cave_worm
  ambient_credits
  ambient_crypt_a
  ambient_crypt_b
  ambient_crypt_c
  ambient_crypt_d
  ambient_crypt_e
  ambient_crypt_f
  ambient_crypt_lich
  ambient_dramatic
  ambient_dwarf
  ambient_fight
  ambient_fight_music
  ambient_gob_castle
  ambient_gob_intro
  ambient_gob_jail_main
  ambient_gob_jail_stress
  ambient_gob_ruin
  Ambient_important_place
  ambient_intro_a
  ambient_intro
  ambient_intro_b
  ambient_menu
  ambient_noden
  ambient_outpost
  ambient_rebels_cool
  ambient_rebels_intense
  ambient_snake_castle
  ambient_snake_illusion
  ambient_tavern
  ambient_temple_akbaa
  ambient_temple_akbaa_up
  ambient_town
  ambient_troll
  reverb_test
  stress
  */

  constructor(props: AmbienceConstructorProps) {
    this.src = props.src
    this.volume = props.volume ?? 100
  }

  setVolume(volume: number) {
    return new Ambience({
      src: this.src,
      volume,
    })
  }
}
