import { addScript, createItem, items, markAsUsed, moveTo } from '../../assets/items'
import { HFLIP, VFLIP } from '../../constants'
import { identity } from '../../faux-ramda'
import { getInjections } from '../../scripting'
import { RelativeCoords, RotationVertex3 } from '../../types'
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
  move,
} from '../../helpers'
import { plain } from '../../prefabs/plain'
import { createWall } from './wall'
import { createDoor } from './door'
import { surface } from '../../prefabs/base/surface'
import { createFern } from '../alias-nightmare/items/fern'
import { createFountain } from './fountain'
import { createTree } from './tree'

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
  light: '#515151',
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

  setColor(colors.light, mapData)
  setTexture(textures.gravel.ground1, mapData)

  plain([0, 0, -200], [14, 16], 'floor', identity, () => ({
    quad: pickRandom([0, 1, 2, 3]),
    textureRotation: pickRandom([0, 90, 180, 270]),
    textureFlags: pickRandom([0, HFLIP, VFLIP, HFLIP | VFLIP]),
  }))(mapData)

  const wallPos: RelativeCoords = { type: 'relative', coords: [-600, 0, 500] }
  const holeOffset: number = 250
  const wallThickness = 800

  plain(move(300, 0, wallThickness / 2, wallPos.coords), [4, wallThickness / 100 + 2], 'floor', identity, () => ({
    quad: pickRandom([0, 1, 2, 3]),
    textureRotation: pickRandom([0, 90, 180, 270]),
    textureFlags: pickRandom([0, HFLIP, VFLIP, HFLIP | VFLIP]),
  }))(mapData)

  createWall(wallPos, [1200, wallThickness], holeOffset, [150, 220], mapData)
  createDoor(
    { type: 'relative', coords: move(150, 0, 20, move(holeOffset, 0, 0, wallPos.coords)) },
    { a: 0, b: 270, g: 0 },
  )
  createDoor(
    { type: 'relative', coords: move(150, 0, wallThickness - 20, move(holeOffset, 0, 0, wallPos.coords)) },
    { a: 0, b: 270, g: 0 },
  )

  setTexture(textures.forest.forest[2], mapData)
  const forestHeight = 500
  surface({ type: 'relative', coords: [-600, 30, -900] }, [1400, forestHeight], { a: 0, b: 90, g: 0 }, [
    100 / (1400 / forestHeight),
    100 / (1400 / forestHeight),
  ])(mapData)
  surface({ type: 'relative', coords: [600, 30, 500] }, [1400, forestHeight], { a: 0, b: -90, g: 0 }, [
    100 / (1400 / forestHeight),
    100 / (1400 / forestHeight),
  ])(mapData)
  surface({ type: 'relative', coords: [600, 30, -900] }, [1200, forestHeight], { a: 0, b: 0, g: 0 }, [
    100 / (1200 / forestHeight),
    100 / (1200 / forestHeight),
  ])(mapData)

  // await createFountain({ type: 'relative', coords: [0, -10, -300] }, 3, mapData)
  await createTree({ type: 'relative', coords: [0, 0, -300] }, 50, mapData)

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

  createFern([-300, 0, 200])
  createFern([120, 0, 300])
  createFern([-200, 0, -140])
  createFern([-400, 0, -200])
  createFern([300, 0, -330])
  createFern([-420, 0, -610])
  createFern([74, 0, -490])

  createPlayerSpawn({ type: 'relative', coords: [0, 0, 0] }, config)

  const finalizedMapData = finalize(mapData)
  return saveToDisk(finalizedMapData)
}

export default generate
