import {
  generateBlankMapData,
  movePlayerTo,
  finalize,
  saveToDisk,
  setColor,
  addZone,
  randomBetween,
  circleOfVectors,
  setTexture,
  setPolygonGroup,
  unsetPolygonGroup,
  move,
  MapData,
} from '../../helpers'
import island from './island'
import { colors, NONE, ALL, NORTH, EAST, SOUTH, WEST } from './constants'
import { ambiences } from '../../assets/ambiences'
import { items, createItem, markAsUsed, moveTo, addScript, addDependencyAs } from '../../assets/items'
import { declare, color, getInjections, FALSE, TRUE } from '../../scripting'
import bridges, { Island } from './bridges'
import { createFern } from './items/fern'
import { createStatue, defineStatue } from './items/statue'
import { textures } from '../../assets/textures'
import { MAP_MAX_WIDTH, MAP_MAX_HEIGHT, PATH_RGB } from '../../constants'
import { plain, disableBumping } from '../../prefabs/plain'
import { createStone } from './items/stone'
import { overridePlayerScript } from '../shared/player'
import { createFallSaver } from './items/fallSaver'
import { AbsoluteCoords, MapConfig, Vector3 } from '../../types'

const createWelcomeMarker = (pos: Vector3, config: MapConfig) => {
  const ref = createItem(items.marker)

  declare('bool', 'hadIntro', FALSE, ref)

  addDependencyAs('reset/map.bmp', `graph/levels/level${config.levelIdx}/map.bmp`, ref)
  addDependencyAs('projects/alias-nightmare/loading.bmp', `graph/levels/level${config.levelIdx}/loading.bmp`, ref)
  addScript((self) => {
    return `
  // component: welcomeMarker
  ON INIT {
    ${getInjections('init', self)}
    SETCONTROLLEDZONE palette0
    // CINEMASCOPE ON
    // WORLDFADE OUT 0 ${color(colors.ambience[0])}
  
    ACCEPT
  }
  ON CONTROLLEDZONE_ENTER {
    if (${self.state.hadIntro} == ${FALSE}) {
      TELEPORT -p ${self.ref}
      SET ${self.state.hadIntro} ${TRUE}
      SETPLAYERCONTROLS OFF
      // TIMERfade 1 2 worldfade IN 2000
      GOTO READY // TIMERmove -m 1 10 SPEAK -p [alia_nightmare2] GOTO READY
  
      ACCEPT
    }
    ACCEPT
  }
  >>READY {
    CINEMASCOPE -s OFF
    SETPLAYERCONTROLS ON
  
    ACCEPT
  }
  `
  }, ref)

  moveTo({ type: 'relative', coords: pos }, { a: 0, b: 0, g: 0 }, ref)

  markAsUsed(ref)

  return ref
}

const generateAtLeastOneExit = () => {
  return Math.round(randomBetween(NONE, ALL)) || 1 << Math.round(randomBetween(0, 3))
}

// creates a large flat plane for the player to fall onto
const createGravityInducer = (origin: AbsoluteCoords, mapData: MapData) => {
  const divider = 4

  setColor('white', mapData)
  setTexture(textures.none, mapData)

  for (let x = 0; x < divider; x++) {
    for (let y = 0; y < divider; y++) {
      setPolygonGroup(`gravity-${x}-${y}`, mapData)
      plain(
        [
          -origin.coords[0] + (MAP_MAX_WIDTH / divider) * 50 + (MAP_MAX_WIDTH / divider) * 100 * x,
          origin.coords[1] + 10000,
          -origin.coords[2] + (MAP_MAX_HEIGHT / divider) * 50 + (MAP_MAX_HEIGHT / divider) * 100 * y,
        ],
        [MAP_MAX_WIDTH / divider, MAP_MAX_HEIGHT / divider],
        'floor',
        disableBumping,
      )(mapData)
      unsetPolygonGroup(mapData)
    }
  }
}

const generate = async (config: MapConfig) => {
  const { origin } = config

  overridePlayerScript()

  const islands: Island[] = [
    {
      pos: [0, 0, 0],
      entrances: EAST,
      exits: NORTH,
      width: 12,
      height: 10,
    },
    {
      pos: [0, -200, 2500],
      entrances: SOUTH | NORTH,
      exits: EAST,
      width: 10,
      height: 10,
    },
    {
      pos: [3000, -100, 2400],
      entrances: WEST,
      exits: NONE,
      width: 10,
      height: 8,
    },
    {
      pos: [0, -500, 4500],
      entrances: SOUTH,
      exits: NONE,
      width: 6,
      height: 6,
    },
  ]

  const welcomeMarker = createWelcomeMarker(islands[0].pos, config)

  // /*
  // createHangingCorpse({ type: 'relative', coords: [-300, -150, -200]}, {a: 0, b: 145, g: 0]}, {
  //   name: "[public_falan_tomb]",
  // });
  // */

  // circleOfVectors(islands[2].pos, 200, 9).forEach((pos) => {
  //   createFern({ type: 'relative', coords: pos })
  // })

  // defineStatue()
  // createStatue(islands[2].pos)

  // createStone(move(-100, -10, 0, islands[0].pos), [0, 0, 0], {
  //   weight: 1,
  //   scale: 0.7,
  // })
  // createStone(move(-200, -10, 0, islands[0].pos), [0, 0, 0], {
  //   weight: 3,
  //   scale: 1.2,
  // })
  // // createStone(move(-200, -10, -100, islands[0].pos), [0, 0, 0], {
  // //   weight: 2,
  // //   scale: 0.9,
  // // })
  // // createStone(move(-100, -10, -100, islands[0].pos), [0, 0, 0], {
  // //   weight: 1,
  // //   scale: 0.8,
  // // })

  const mapData = generateBlankMapData(config)

  mapData.meta.mapName = "Alia's Nightmare"
  movePlayerTo(
    {
      type: 'relative',
      coords: [-origin.coords[0], -origin.coords[1], -origin.coords[2]],
    },
    mapData,
  )
  setColor(colors.ambience[0], mapData)

  addZone(
    {
      type: 'relative',
      coords: [-origin.coords[0], -origin.coords[1], -origin.coords[2]],
    },
    [100, 0, 100],
    'palette0',
    ambiences.sirs,
    5000,
  )(mapData)

  // setColor(colors.ambience[0], mapData)

  // addZone(
  //   { type: 'relative', coords: [0, 5000, 0] },
  //   [MAP_MAX_WIDTH * 100, 1000, MAP_MAX_HEIGHT * 100],
  //   `fall-detector`,
  //   ambiences.none,
  //   0,
  //   PATH_RGB,
  // )(mapData)

  // // createFallSaver(islands[0].pos, welcomeMarker)
  // // createGravityInducer(origin, mapData)

  // // setTexture(textures.stone.templeWall[2], mapData)
  // // pillars(islands[0].pos, 20, 5000, 1000, [200, 200, 0, 0], mapData)

  islands.forEach((config) => {
    island(config, mapData)
  })

  bridges(islands, mapData)

  const finalizedMapData = finalize(mapData)
  return saveToDisk(finalizedMapData)
}

export default generate