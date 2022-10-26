import { addScript, createItem, items, markAsUsed, moveTo } from '../../assets/items'
import { HFLIP, VFLIP } from '../../constants'
import { identity } from '../../faux-ramda'
import { surface } from '../../prefabs/base/surface'
import { declare, FALSE, getInjections, TRUE } from '../../scripting'
import { RelativeCoords, RotationVertex3 } from '../../types'
import { hideMinimap } from '../shared/reset'

const { ambiences } = require('../../assets/ambiences')
const { textures } = require('../../assets/textures')
const {
  generateBlankMapData,
  movePlayerTo,
  setColor,
  addZone,
  setTexture,
  finalize,
  saveToDisk,
  pickRandom,
  circleOfVectors,
  addLight,
} = require('../../helpers')
const { plain } = require('../../prefabs/plain')

const createPlayerSpawn = (pos: RelativeCoords, config) => {
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

  moveTo(pos, [0, 0, 0], ref)
  markAsUsed(ref)

  return ref
}

const addDoor = (pos: RelativeCoords, { a, b, g }: RotationVertex3) => {
  const ref = createItem(items.doors.lightDoor, { name: 'door' })

  declare('bool', 'open', FALSE, ref)
  declare('bool', 'unlock', TRUE, ref)

  addScript((self) => {
    return `
// component: door
ON INIT {
  ${getInjections('init', self)}
  ACCEPT
}
    `
  }, ref)

  moveTo(pos, [a, b, g], ref)
  markAsUsed(ref)

  return ref
}

const colors: Record<string, string> = {
  sky: '#223340',
  ground: '#a7a7a7',
  light: 'white',
}

const generate = async (config) => {
  const { origin } = config

  const mapData = generateBlankMapData(config)
  mapData.meta.mapName = 'Palace'

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

  setColor(colors.ground, mapData)
  setTexture(textures.gravel.ground1, mapData)

  plain([0, 0, 0], [14, 30], 'floor', identity, () => ({
    quad: pickRandom([0, 1, 2, 3]),
    textureRotation: pickRandom([0, 90, 180, 270]),
    textureFlags: pickRandom([0, HFLIP, VFLIP, HFLIP | VFLIP]),
  }))(mapData)

  setTexture(textures.stone.stone[0], mapData)
  surface({ type: 'relative', coords: [-500, 0, 290] }, [200, 30], { a: 0, b: 180, g: 0 }, [100, 100])(mapData)
  surface(
    { type: 'relative', coords: [-500, -30, 290] },
    [200, 15],
    { a: -45, b: 180, g: 0 },
    [100, 100],
    [0, -30],
  )(mapData)

  surface({ type: 'relative', coords: [-150, 0, 290] }, [300, 30], { a: 0, b: 180, g: 0 }, [100, 100])(mapData)
  surface(
    { type: 'relative', coords: [-150, -30, 290] },
    [300, 15],
    { a: -45, b: 180, g: 0 },
    [100, 100],
    [0, -30],
  )(mapData)

  setTexture(textures.wall.castle, mapData)

  surface({ type: 'relative', coords: [-500, -40, 300] }, [200, 240], { a: 0, b: 180, g: 0 }, [100, 100])(mapData)
  surface({ type: 'relative', coords: [-300, -220, 300] }, [150, 60], { a: 0, b: 180, g: 0 }, [100, 100])(mapData)
  surface({ type: 'relative', coords: [-150, -40, 300] }, [300, 240], { a: 0, b: 180, g: 0 }, [100, 100])(mapData)

  surface({ type: 'relative', coords: [-300, -40, 300] }, [20, 180], { a: 0, b: 90, g: 0 }, [100, 100])(mapData)
  surface({ type: 'relative', coords: [-300, -220, 300] }, [20, 150], { a: -90, b: 0, g: 90 }, [100, 100])(mapData)
  surface({ type: 'relative', coords: [-150, -40, 320] }, [20, 180], { a: 0, b: -90, g: 0 }, [100, 100])(mapData)

  setTexture(textures.stone.roof, mapData)
  for (let i = 0; i < 9; i++) {
    surface(
      { type: 'relative', coords: [-500 + i * 70, -280, 300] },
      [70, 70],
      { a: 0, b: 180, g: 0 },
      [200, 200],
      [50, 0],
    )(mapData)
  }
  surface(
    { type: 'relative', coords: [-500 + 9 * 70, -280, 300] },
    [20, 70],
    { a: 0, b: 180, g: 0 },
    [200 / (20 / 70), 200 / (20 / 70)],
    [50, 0],
  )(mapData)

  addDoor({ type: 'relative', coords: [-150, 0, 310] }, { a: 0, b: 270, g: 0 })

  setColor(colors.light, mapData)
  circleOfVectors([0, -1000, 0], 1000, 3).forEach((pos) => {
    addLight(
      pos,
      {
        fallstart: 1,
        fallend: 3000,
        intensity: 3,
      },
      mapData,
    )
  })

  createPlayerSpawn({ type: 'relative', coords: [0, 0, 0] }, config)

  const finalizedMapData = finalize(mapData)
  return saveToDisk(finalizedMapData)
}

export default generate
