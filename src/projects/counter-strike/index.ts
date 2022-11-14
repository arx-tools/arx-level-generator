import { addScript, createItem, items, markAsUsed, moveTo } from '../../assets/items'
import { getInjections } from '../../scripting'
import { MapConfig, RelativeCoords } from '../../types'
import { hideMinimap } from '../shared/reset'
import { ambiences } from '../../assets/ambiences'
import {
  generateBlankMapData,
  movePlayerTo,
  setColor,
  addZone,
  finalize,
  saveToDisk,
  addLight,
  circleOfVectors,
} from '../../helpers'
import { createCsItaly } from './maps/cs_italy'
import { createChicken, defineChicken } from './chicken'
import { createSoundPlayer, defineSoundPlayer } from './soundPlayer'
import { createDeDust } from './maps/de_dust'
import { createDoor } from '../forest/door'

const createPlayerSpawn = (pos: RelativeCoords, config: MapConfig) => {
  const ref = createItem(items.marker)

  hideMinimap(config.levelIdx, ref)

  addScript((self) => {
    return `
// component: playerSpawn
ON INIT {
  ${getInjections('init', self)}
  SETCONTROLLEDZONE sky-color-setter
  ACCEPT
}

ON CONTROLLEDZONE_ENTER {
  TELEPORT -p self
  ACCEPT
}
    `
  }, ref)

  moveTo(pos, { a: 0, b: 0, g: 0 }, ref)
  markAsUsed(ref)

  return ref
}

const addGuitarSounds = (pos: RelativeCoords) => {
  createSoundPlayer(pos, {
    filename: 'guitar',
    pitchbend: false,
  })
}
const addOperaSound = (pos: RelativeCoords) => {
  createSoundPlayer(pos, {
    filename: 'opera',
    pitchbend: false,
  })
}

const colors: Record<string, string> = {
  sky: '#b0d6f5',
  general: '#a0a0a0',
}

const generate = async (config: MapConfig) => {
  const { origin } = config

  const mapData = generateBlankMapData(config)
  mapData.meta.mapName = 'Counter Strike'

  movePlayerTo(
    {
      type: 'relative',
      coords: [-origin.coords[0], -origin.coords[1], -origin.coords[2]],
    },
    mapData,
  )

  setColor(colors.sky, mapData)
  addZone(
    {
      type: 'relative',
      coords: [-origin.coords[0], -origin.coords[1], -origin.coords[2]],
    },
    [100, 0, 100],
    'sky-color-setter',
    ambiences.none,
    5000,
  )(mapData)

  setColor(colors.general, mapData)

  const mapName: string = 'cs_italy'

  switch (mapName) {
    case 'de_dust':
      createPlayerSpawn({ type: 'relative', coords: [-(6000 - 2809), 0, -(6000 - 1565)] }, config)
      circleOfVectors([-1300, -2000, -500], 5000, 7).forEach((pos) => {
        addLight(pos, { fallstart: 1, fallend: 5000, intensity: 3 }, mapData)
      })
      await createDeDust({ type: 'relative', coords: [0, 0, 2000] }, 40, mapData)
      mapData.state.spawnAngle -= 90
      break
    case 'cs_italy':
      createPlayerSpawn({ type: 'relative', coords: [-1000, 0, -(6000 - 2600)] }, config)
      await createCsItaly({ type: 'relative', coords: [700, 3200, 5000] }, 2.5, mapData)

      defineSoundPlayer({
        guitar: 'projects/counter-strike/sounds/guit1.wav', // Rossiniana No. 2, Op. 120
        opera: 'projects/counter-strike/sounds/opera.wav', // E'Il Sol Dell' Anima (from Verdi's Rigoletto)
      })

      addGuitarSounds({
        type: 'relative',
        coords: [-origin.coords[0] + 3640, -origin.coords[1] + -100, -origin.coords[2] + 6850],
      })
      addOperaSound({ type: 'relative', coords: [3200, -700, 7200] })

      defineChicken()
      createChicken({ type: 'relative', coords: [1180, 80, 165] }, { a: 0, b: 0, g: 0 })

      const doorProps = { scale: 1.08, isLocked: true }

      createDoor({ type: 'relative', coords: [1260, 88, -625] }, { a: 0, b: 90, g: 0 }, doorProps)
      createDoor({ type: 'relative', coords: [2300, 88, -544] }, { a: 0, b: 90, g: 0 }, doorProps)
      createDoor({ type: 'relative', coords: [3042, 88, 79] }, { a: 0, b: 180, g: 0 }, doorProps)
      createDoor({ type: 'relative', coords: [1037, 87, 1679] }, { a: 0, b: 0, g: 0 }, doorProps)
      createDoor({ type: 'relative', coords: [800, 87, 2939] }, { a: 0, b: 90, g: 0 }, doorProps)
      createDoor({ type: 'relative', coords: [83, 93, -401] }, { a: 0, b: 180, g: 0 }, doorProps)
      createDoor({ type: 'relative', coords: [-2083, 88, -81] }, { a: 0, b: 0, g: 0 }, doorProps)
      createDoor({ type: 'relative', coords: [-2223, 88, 939] }, { a: 0, b: 0, g: 0 }, doorProps)
      createDoor({ type: 'relative', coords: [-153, -315, 7519] }, { a: 0, b: 0, g: 0 }, doorProps)
      createDoor({ type: 'relative', coords: [2400, 67, 3039] }, { a: 0, b: 0, g: 0 }, doorProps)
      createDoor({ type: 'relative', coords: [3320, 186, 3199] }, { a: 0, b: 180, g: 0 }, doorProps)

      break
  }

  const finalizedMapData = finalize(mapData)
  return saveToDisk(finalizedMapData)
}

export default generate
