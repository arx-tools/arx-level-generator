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
  randomBetween,
  isBetweenInclusive,
} from '../../helpers'
import { plain } from '../../prefabs/plain'
import { createWall } from './wall'
import { createDoor } from './door'
import { surface, uvFitToHeight } from '../../prefabs/base/surface'
import { createFern } from '../alias-nightmare/items/fern'
import { createTree } from './tree'
import { createHangingCorpse } from '../alias-nightmare/items/hangingCorpse'
import { Vector3 } from 'three'

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
  setTexture(textures.ground.moss, mapData)

  plain([0, 0, -200], [14, 16], 'floor', identity, () => ({
    quad: pickRandom([0, 1, 2, 3]),
    textureRotation: pickRandom([0, 90, 180, 270]),
    textureFlags: pickRandom([0, HFLIP, VFLIP, HFLIP | VFLIP]),
  }))(mapData)

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

  const forestHeight = 500
  setTexture(textures.forest.forest[2], mapData)
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

  // setColor('white', mapData)
  // await createFountain({ type: 'relative', coords: [0, -10, -300] }, 3, mapData)

  await createTree({ type: 'relative', coords: [0, 0, -300] }, 50, mapData)

  let plantsToCreate = 20
  const coords: Vector3[] = []
  while (coords.length < plantsToCreate) {
    const x = randomBetween(-600, 600)
    const z = randomBetween(-800, 400)
    if (isBetweenInclusive(-30, 30, x) || isBetweenInclusive(-30, 30, z)) {
      continue
    }
    const newCoord = new Vector3(x, 0, z)
    if (coords.find((coord) => coord.distanceTo(newCoord) < 150)) {
      continue
    }
    coords.push(newCoord)
    createFern({ type: 'relative', coords: newCoord.toArray() }, { a: 0, b: randomBetween(0, 360), g: 0 })
  }

  createHangingCorpse({ type: 'relative', coords: [290, -290, -80] }, { a: 0, b: 195, g: 0 })

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
