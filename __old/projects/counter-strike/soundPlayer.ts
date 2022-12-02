import {
  addDependencyAs,
  addScript,
  createItem,
  createRootItem,
  InjectableProps,
  ItemDefinition,
  markAsUsed,
  moveTo,
} from '../../assets/items'
import {
  declare,
  FALSE,
  getInjections,
  playSound,
  PLAY_LOOP,
  PLAY_UNIQUE,
  PLAY_VARY_PITCH,
  TRUE,
} from '../../scripting'
import { RelativeCoords } from '../../types'

const soundPlayerDesc: ItemDefinition = {
  src: 'fix_inter/sound_player/sound_player.teo',
  native: true,
}

export const defineSoundPlayer = (sounds: Record<string, string>) => {
  const rootRef = createRootItem(soundPlayerDesc, {
    name: 'sound-player',
    interactive: false,
    mesh: 'polytrans/polytrans.teo',
  })

  declare('string', 'filename', '', rootRef)
  declare('bool', 'pitchbend', FALSE, rootRef)

  addScript((self) => {
    return `
// component: sound-player
ON INIT {
  ${getInjections('init', self)}
  ACCEPT
}

ON INITEND {
  IF (${rootRef.state.filename} != "") {
    // [l] = loop, [i] = unique, [p] = variable pitch
    IF (${rootRef.state.pitchbend} == ${TRUE}) {
      ${playSound(rootRef.state.filename, PLAY_LOOP | PLAY_UNIQUE | PLAY_VARY_PITCH)}
    } ELSE {
      ${playSound(rootRef.state.filename, PLAY_LOOP | PLAY_UNIQUE)}
    }
  }
  ACCEPT
}
    `
  }, rootRef)

  Object.entries(sounds).forEach(([filename, source]) => {
    addDependencyAs(source, `sfx/${filename}.wav`, rootRef)
  })

  return rootRef
}

type SoundPlayerSpecificProps = {
  filename: string
  pitchbend: boolean
}

export const createSoundPlayer = (
  pos: RelativeCoords,
  { filename, pitchbend, ...props }: InjectableProps & SoundPlayerSpecificProps,
) => {
  const ref = createItem(soundPlayerDesc, { ...props })

  declare('string', 'filename', filename, ref)
  declare('bool', 'pitchbend', pitchbend ? TRUE : FALSE, ref)

  addScript((self) => {
    return `
// component: sound-player
ON INIT {
  ${getInjections('init', self)}
  ACCEPT
}
    `
  }, ref)

  moveTo(pos, { a: 0, b: 0, g: 0 }, ref)
  markAsUsed(ref)

  return ref
}
