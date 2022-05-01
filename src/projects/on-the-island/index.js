import { createRune } from '@items/createRune'
import { compose, identity, uniq } from 'ramda'
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
import {
  createCampfire,
  createCampfireCookMarker,
  createCampfireCookZone,
  createCampfireFlames,
} from './items/campfire'
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

const createCards = (pos, angle = [0, 0, 0], props = {}) => {
  const item = createItem(items.misc.deckOfCards, props)
  moveTo({ type: 'relative', coords: pos }, angle, item)
  markAsUsed(item)
  return item
}

const generate = async (config) => {
  const { origin } = config

  const islandSizeInTiles = 8
  const islandSize = islandSizeInTiles * 100
  const islandRadius = islandSize / 2
  const islandCenter = { x: islandSize / 2, z: islandSize / 2 }

  createWelcomeMarker([islandCenter.x, 0, islandCenter.z + islandRadius * 0.5])

  createGoblin(
    [
      islandCenter.x - islandRadius * 0.75,
      0,
      islandCenter.z - islandRadius * 0.75,
    ],
    [0, 135, 0],
  )

  const fishSpawnCoords = []

  const distanceBetweenSpawns = 800

  for (
    let x = 0;
    x <= Math.floor(islandCenter.x / distanceBetweenSpawns) + 1;
    x++
  ) {
    for (
      let z = 0;
      z <= Math.floor(islandCenter.z / distanceBetweenSpawns) + 1;
      z++
    ) {
      fishSpawnCoords.push([
        -islandCenter.x - islandRadius + x * distanceBetweenSpawns,
        islandCenter.z - islandRadius + z * distanceBetweenSpawns,
      ])
      fishSpawnCoords.push([
        -islandCenter.x - islandRadius + x * distanceBetweenSpawns,
        -islandCenter.z - islandRadius + z * distanceBetweenSpawns,
      ])
      fishSpawnCoords.push([
        islandCenter.x - islandRadius + x * distanceBetweenSpawns,
        -islandCenter.z - islandRadius + z * distanceBetweenSpawns,
      ])
    }
  }

  uniq(fishSpawnCoords).forEach(([x, z]) => {
    createFishSpawn([x, 50, z])
  })

  createCampfire({
    type: 'relative',
    coords: [islandCenter.x, -10, islandCenter.z],
  })

  const startingLoot = [
    compose(markAsUsed, createItem)(items.misc.pole),
    compose(markAsUsed, createItem)(items.misc.rope),
    createRune('aam'),
    createRune('yok'),
  ]

  createBarrel(
    [islandCenter.x - islandRadius * 0.75, 0, islandCenter.z],
    [0, 0, 0],
    startingLoot,
  )
  createCards([islandCenter.x - islandRadius * 0.75, -120, islandCenter.z + 30])

  return compose(
    saveToDisk,
    finalize,

    (mapData) => {
      createCampfireFlames(
        { type: 'relative', coords: [islandCenter.x - 6, -40, islandCenter.z] },
        mapData,
      )

      createCampfireCookZone(
        { type: 'relative', coords: [islandCenter.x - 6, 0, islandCenter.z] },
        'cookzone',
        mapData,
      )

      createCampfireCookMarker(
        { type: 'relative', coords: [islandCenter.x - 6, -40, islandCenter.z] },
        'cookzone',
      )

      setColor('white', mapData)
      circleOfVectors([0, -1000, 0], 1000, 3).forEach((pos) => {
        addLight(pos, {
          fallstart: 1,
          fallend: 3000,
          intensity: 3,
        })(mapData)
      })

      return mapData
    },

    plain([0, 10, 0], [50, 50], 'floor', disableBumping),
    setTexture(textures.water.cave),
    setColor('lightblue'),

    unsetPolygonGroup,
    plain(
      [-islandCenter.x, 210, islandCenter.z],
      [islandSizeInTiles, islandSizeInTiles],
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
      [-islandCenter.x, 140, -islandCenter.z],
      [islandSizeInTiles, islandSizeInTiles],
      'floor',
      connectToNearPolygons('island-2'),
      () => ({
        textureRotation: pickRandom([0, 90, 180, 270]),
        textureFlags: pickRandom([0, HFLIP, VFLIP, HFLIP | VFLIP]),
      }),
    ),
    setPolygonGroup('island-3'),
    plain(
      [islandCenter.x, 70, -islandCenter.z],
      [islandSizeInTiles, islandSizeInTiles],
      'floor',
      connectToNearPolygons('island-1'),
      () => ({
        textureRotation: pickRandom([0, 90, 180, 270]),
        textureFlags: pickRandom([0, HFLIP, VFLIP, HFLIP | VFLIP]),
      }),
    ),
    setPolygonGroup('island-2'),
    plain(
      [islandCenter.x, 0, islandCenter.z],
      [islandSizeInTiles, islandSizeInTiles],
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
      mapData.state.spawnAngle = 180
      return mapData
    },

    generateBlankMapData,
  )(config)
}

export default generate
