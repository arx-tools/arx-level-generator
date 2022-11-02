import { addDependencyAs, addScript, createItem, createRootItem, markAsUsed, moveTo } from '../../assets/items'
import { declare, FALSE, getInjections, TRUE } from '../../scripting'
import { RelativeCoords } from '../../types'

const soundPlayerDefinition = {
  src: 'fix_inter/sound_player/sound_player.teo',
  native: true,
}

export const defineSoundPlayer = (sounds: Record<string, string>) => {
  const rootRef = createRootItem(soundPlayerDefinition, {
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
      PLAY -lip ${rootRef.state.filename}
    } ELSE {
      PLAY -li ${rootRef.state.filename}
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

export const createSoundPlayer = (
  pos: RelativeCoords,
  { filename, pitchbend }: { filename: string; pitchbend: boolean },
) => {
  const ref = createItem(soundPlayerDefinition)

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

  moveTo(pos, [0, 0, 0], ref)
  markAsUsed(ref)

  return ref
}
