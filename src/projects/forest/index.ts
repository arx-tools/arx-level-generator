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
import { addWall } from './addWall'
import { addDoor } from './addDoor'
import { surface } from '../../prefabs/base/surface'
import { createSmellyFlower } from '../alias-nightmare/items/smellyFlower'

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

const addWorm = (pos: RelativeCoords, { a, b, g }: RotationVertex3) => {
  const ref = createItem(items.npc.worm, { name: 'Jimmy' })

  addScript((self) => {
    return `
// component: worm
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
  //sky: '#223340',
  sky: '#070707',
  ground: '#a7a7a7',
  light: 'white',
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

  setColor(colors.ground, mapData)
  setTexture(textures.gravel.ground1, mapData)

  plain([0, 0, 500], [14, 30], 'floor', identity, () => ({
    quad: pickRandom([0, 1, 2, 3]),
    textureRotation: pickRandom([0, 90, 180, 270]),
    textureFlags: pickRandom([0, HFLIP, VFLIP, HFLIP | VFLIP]),
  }))(mapData)

  const wallPos: RelativeCoords = { type: 'relative', coords: [-600, 0, 500] }
  const holeOffset: number = 250
  const wallThickness = 800

  addWall(wallPos, [1200, wallThickness], holeOffset, [150, 220], mapData)
  addDoor(
    { type: 'relative', coords: move(150, 0, 20, move(holeOffset, 0, 0, wallPos.coords)) },
    { a: 0, b: 270, g: 0 },
  )
  addDoor(
    { type: 'relative', coords: move(150, 0, wallThickness - 20, move(holeOffset, 0, 0, wallPos.coords)) },
    { a: 0, b: 270, g: 0 },
  )
  addWorm(
    { type: 'relative', coords: move(150 - 70, 0, wallThickness - 20 + 210, move(holeOffset, 0, 0, wallPos.coords)) },
    { a: 0, b: 180, g: 0 },
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

  createSmellyFlower([-300, 0, 200])
  createSmellyFlower([120, 0, 300])
  createSmellyFlower([-200, 0, -140])
  createSmellyFlower([-400, 0, -200])
  createSmellyFlower([300, 0, -330])
  createSmellyFlower([-420, 0, -610])
  createSmellyFlower([74, 0, -490])

  createPlayerSpawn({ type: 'relative', coords: [0, 0, 0] }, config)

  const finalizedMapData = finalize(mapData)
  return saveToDisk(finalizedMapData)
}

export default generate
