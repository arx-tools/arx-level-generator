import { addScript, createItem, items, markAsUsed, moveTo } from '../../assets/items'
import { HFLIP, VFLIP } from '../../constants'
import { identity } from '../../faux-ramda'
import { getInjections } from '../../scripting'
import { RelativeCoords } from '../../types'
import { hideMinimap } from '../shared/reset'
import { ambiences } from '../../assets/ambiences'
import { textures } from '../../assets/textures'
import {
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
} from '../../helpers'
import { plain } from '../../prefabs/plain'
import { addWall } from './addWall'

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

  addWall({ type: 'relative', coords: [-600, 0, 200] }, [1200, 40], mapData)

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
