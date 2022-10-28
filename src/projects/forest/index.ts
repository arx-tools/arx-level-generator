import { addScript, createItem, items, markAsUsed, moveTo } from '../../assets/items'
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
  circleOfVectors,
  addLight,
  move,
} from '../../helpers'
import { createWall } from './wall'
import { createDoor } from './door'
import { surface, uvFitToHeight } from '../../prefabs/base/surface'
import { createForestArea } from './areas/forest'

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
  sky: '#010101',
  general: '#515151',
}

const generate = async (config) => {
  const { origin } = config

  const mapData = generateBlankMapData(config)
  mapData.meta.mapName = 'Forest'

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
    ambiences.worm,
    5000,
  )(mapData)

  setColor(colors.general, mapData)

  const wallPos: RelativeCoords = { type: 'relative', coords: [-600, 0, 500] }
  const holeOffset: number = 250
  const wallThickness = 800

  setTexture(textures.ground.mossBorder, mapData)
  surface(
    { type: 'relative', coords: move(holeOffset + 200 - 25, 0, 0, wallPos.coords) },
    [200, 200],
    {
      a: 90,
      b: 0,
      g: -90,
    },
    uvFitToHeight([200, 200]),
    [0, 0],
  )(mapData)

  setTexture(textures.ground.rock, mapData)
  surface(
    { type: 'relative', coords: move(holeOffset + 200 - 25, 0, 200, wallPos.coords) },
    [wallThickness - 150, 200],
    {
      a: 90,
      b: 0,
      g: -90,
    },
    uvFitToHeight([wallThickness - 150, 200]),
  )(mapData)

  createWall(wallPos, [1200, wallThickness], holeOffset, [150, 220], mapData)
  createDoor(
    { type: 'relative', coords: move(150, 0, 40, move(holeOffset, 0, 0, wallPos.coords)) },
    { a: 0, b: 270, g: 0 },
  )
  createDoor(
    { type: 'relative', coords: move(150, 0, wallThickness - 40, move(holeOffset, 0, 0, wallPos.coords)) },
    { a: 0, b: 270, g: 0 },
  )

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

  await createForestArea(mapData)

  const finalizedMapData = finalize(mapData)
  return saveToDisk(finalizedMapData)
}

export default generate
