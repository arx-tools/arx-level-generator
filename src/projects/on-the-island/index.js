import { compose, identity } from 'ramda'
import { ambiences } from '../../assets/ambiences'
import {
  items,
  createItem,
  moveTo,
  markAsUsed,
  addScript,
} from '../../assets/items'
import { textures } from '../../assets/textures'
import { HFLIP, VFLIP } from '../../constants'
import {
  saveToDisk,
  finalize,
  generateBlankMapData,
  movePlayerTo,
  addZone,
  setColor,
  setTexture,
  addLight,
  pickRandom,
  circleOfVectors,
  setPolygonGroup,
  unsetPolygonGroup,
} from '../../helpers'
import { plain } from '../../prefabs'
import { disableBumping, connectToNearPolygons } from '../../prefabs/plain'
import { getInjections } from '../../scripting'
import { createGoblin } from './items/goblin'

const createWelcomeMarker = (pos) => {
  return compose(
    markAsUsed,
    moveTo({ type: 'relative', coords: pos }, [0, 0, 0]),
    addScript((self) => {
      return `
// component: welcomeMarker
ON INIT {
  ${getInjections('init', self)}
  SETCONTROLLEDZONE palette0
  ACCEPT
}

ON CONTROLLEDZONE_ENTER {
  TELEPORT -p ${self.ref}
  ACCEPT
}
      `
    }),
    createItem,
  )(items.marker)
}

const createPlant = (pos) => {
  return compose(
    markAsUsed,
    moveTo({ type: 'relative', coords: pos }, [0, 0, 0]),
    createItem,
  )(items.plants.fern)
}

const createAmikarsRock = (pos) => {
  return compose(
    markAsUsed,
    moveTo({ type: 'relative', coords: pos }, [0, 0, 0]),
    createItem,
  )(items.magic.amikarsRock)
}

const createFishSpawn = (pos) => {
  return compose(
    markAsUsed,
    moveTo({ type: 'relative', coords: pos }, [0, 0, 0]),
    createItem,
  )(items.fishSpawn)
}

const createBarrel = (pos, angle, contents = []) => {
  return compose(
    markAsUsed,
    moveTo({ type: 'relative', coords: pos }, angle),
    addScript((self) => {
      return `
// component: barrel
ON INIT {
  ${getInjections('init', self)}

  // setscale 75

  ${contents
    .map(({ ref }) => {
      return `inventory addfromscene "${ref}"`
    })
    .join('  \n')}

  ACCEPT
}
      `
    }),
    createItem,
  )(items.containers.barrel)
}

const generate = async (config) => {
  const { origin } = config

  const islandSize = 10

  createWelcomeMarker([islandSize * 50, 0, islandSize * 50])

  createGoblin([(islandSize * 50) / 2, 0, (islandSize * 50) / 2], [0, 135, 0])

  createFishSpawn([-(islandSize * 50), 50, islandSize * 50])
  createFishSpawn([-(islandSize * 50), 50, -(islandSize * 50)])
  createFishSpawn([islandSize * 50, 50, -(islandSize * 50)])

  createPlant([700, -10, 700])

  const startingLoot = [
    compose(markAsUsed, createItem)(items.misc.pole),
    compose(markAsUsed, createItem)(items.misc.rope),
  ]

  createBarrel(
    [(islandSize * 50) / 2, 0, islandSize * 50 - 50],
    [0, 0, 0],
    startingLoot,
  )

  createAmikarsRock([-500, 220, 500])

  return compose(
    saveToDisk,
    finalize,

    (mapData) => {
      circleOfVectors([0, -1000, 0], 1000, 3).forEach((pos) => {
        addLight(pos, {
          fallstart: 1,
          fallend: 3000,
          intensity: 3,
        })(mapData)
      })

      return mapData
    },
    setColor('white'),

    plain([0, 10, 0], [50, 50], 'floor', disableBumping),
    setTexture(textures.water.cave),
    setColor('lightblue'),

    unsetPolygonGroup,
    plain(
      [-(islandSize * 50), 210, islandSize * 50],
      [islandSize, islandSize],
      'floor',
      (polygons, mapData) => {
        // TODO: don't know why this only works in this particular order and not the other way around
        polygons = connectToNearPolygons('island-1', 200)(polygons, mapData)
        polygons = connectToNearPolygons('island-3', 100)(polygons, mapData)
        return polygons
      },
      () => ({
        textureRotation: pickRandom([0, 90, 180, 270]),
        textureFlags: pickRandom([0, HFLIP, VFLIP, HFLIP | VFLIP]),
      }),
    ),
    setPolygonGroup('island-4'),
    plain(
      [-(islandSize * 50), 140, -(islandSize * 50)],
      [islandSize, islandSize],
      'floor',
      connectToNearPolygons('island-2'),
      () => ({
        textureRotation: pickRandom([0, 90, 180, 270]),
        textureFlags: pickRandom([0, HFLIP, VFLIP, HFLIP | VFLIP]),
      }),
    ),
    setPolygonGroup('island-3'),
    plain(
      [islandSize * 50, 70, -(islandSize * 50)],
      [islandSize, islandSize],
      'floor',
      connectToNearPolygons('island-1'),
      () => ({
        textureRotation: pickRandom([0, 90, 180, 270]),
        textureFlags: pickRandom([0, HFLIP, VFLIP, HFLIP | VFLIP]),
      }),
    ),
    setPolygonGroup('island-2'),
    plain(
      [islandSize * 50, 0, islandSize * 50],
      [islandSize, islandSize],
      'floor',
      identity,
      () => ({
        textureRotation: pickRandom([0, 90, 180, 270]),
        textureFlags: pickRandom([0, HFLIP, VFLIP, HFLIP | VFLIP]),
      }),
    ),
    setPolygonGroup('island-1'),
    setTexture(textures.gravel.ground1),
    setColor('hsv(150, 37%, 70%)'),

    addZone(
      {
        type: 'relative',
        coords: [-origin.coords[0], -origin.coords[1], -origin.coords[2]],
      },
      [100, 0, 100],
      'palette0',
      ambiences.none,
      2000,
    ),
    setColor('#DBF4FF'),

    movePlayerTo({
      type: 'relative',
      coords: [-origin.coords[0], -origin.coords[1], -origin.coords[2]],
    }),
    (mapData) => {
      mapData.meta.mapName = 'On the island'
      return mapData
    },

    generateBlankMapData,
  )(config)
}

export default generate
