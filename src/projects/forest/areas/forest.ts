import { createFern } from '../../alias-nightmare/items/fern'
import { createTree } from '../tree'
import { createHangingCorpse } from '../../alias-nightmare/items/hangingCorpse'
import { Vector3 } from 'three'
import {
  randomBetween,
  isBetweenInclusive,
  MapData,
  setTexture,
  pickRandom,
  setColor,
  addLight,
  circleOfVectors,
} from '../../../helpers'
import { surface, uvFitToHeight } from '../../../prefabs/base/surface'
import { textures } from '../../../assets/textures'
import { identity } from '../../../faux-ramda'
import { plain } from '../../../prefabs/plain'
import {
  HFLIP,
  TEXTURE_QUAD_BOTTOM_LEFT,
  TEXTURE_QUAD_BOTTOM_RIGHT,
  TEXTURE_QUAD_TOP_LEFT,
  TEXTURE_QUAD_TOP_RIGHT,
  VFLIP,
} from '../../../constants'
import { createFountain } from '../fountain'
import { createCrickets, defineCrickets } from '../crickets'

const addPlants = (plantsToCreate: number) => {
  const coords: Vector3[] = []
  const excludedLocations = [
    { pos: new Vector3(0, 0, -300), radius: 100 }, // tree
    { pos: new Vector3(300, 0, 300), radius: 150 }, // fountain
  ]
  while (coords.length < plantsToCreate) {
    const x = randomBetween(-600, 600)
    const z = randomBetween(-800, 400)

    const newCoord = new Vector3(x, 0, z)

    // distance to objects
    if (excludedLocations.find(({ pos, radius }) => pos.distanceTo(newCoord) < radius)) {
      continue
    }

    // distance to each other
    if (coords.find((coord) => coord.distanceTo(newCoord) < 50)) {
      continue
    }

    coords.push(newCoord)

    createFern(
      { type: 'relative', coords: newCoord.toArray() },
      { a: 0, b: randomBetween(0, 360), g: 0 },
      {
        name: '[fern]',
      },
    )
  }
}

const addForestEdge = (forestHeight: number, mapData: MapData) => {
  setTexture(textures.forest.forest[2], mapData)
  surface(
    { type: 'relative', coords: [-600, 30, -900] },
    [1400, forestHeight],
    { a: 0, b: 90, g: 0 },
    uvFitToHeight([1400, forestHeight]),
  )(mapData)
  surface(
    { type: 'relative', coords: [600, 30, 500] },
    [1400, forestHeight],
    { a: 0, b: -90, g: 0 },
    uvFitToHeight([1400, forestHeight]),
  )(mapData)
  surface(
    { type: 'relative', coords: [600, 30, -900] },
    [1200, forestHeight],
    { a: 0, b: 0, g: 0 },
    uvFitToHeight([1200, forestHeight]),
  )(mapData)
}

const addForestFloor = (mapData: MapData) => {
  setTexture(textures.ground.moss, mapData)

  plain([0, 0, -200], [14, 16], 'floor', identity, () => ({
    quad: pickRandom([
      TEXTURE_QUAD_TOP_LEFT,
      TEXTURE_QUAD_TOP_RIGHT,
      TEXTURE_QUAD_BOTTOM_LEFT,
      TEXTURE_QUAD_BOTTOM_RIGHT,
    ]),
    textureRotation: pickRandom([0, 90, 180, 270]),
    textureFlags: pickRandom([0, HFLIP, VFLIP, HFLIP | VFLIP]),
  }))(mapData)
}

export const createForestArea = async (mapData: MapData) => {
  addForestFloor(mapData)
  addForestEdge(500, mapData)
  addPlants(30)

  await createTree({ type: 'relative', coords: [0, 0, -300] }, 50, mapData)
  await createFountain({ type: 'relative', coords: [300, -10, 300] }, 3, mapData)

  createHangingCorpse(
    { type: 'relative', coords: [290, -290, -80] },
    { a: 0, b: 195, g: 0 },
    {
      name: '[hanging-corpse]',
    },
  )

  defineCrickets()

  circleOfVectors([0, -100, -300], 1300, 7)
    .filter(([, , z]) => z < 200)
    .forEach((coords) => {
      createCrickets({ type: 'relative', coords })
    })

  setColor('#161918', mapData)
  circleOfVectors([0, -200, 0], 500, 5).forEach(([x, y, z]) => {
    addLight(
      [x, y, -z - 300],
      {
        fallstart: 1,
        fallend: 1000,
        intensity: 2.5,
      },
      mapData,
    )
  })
}
