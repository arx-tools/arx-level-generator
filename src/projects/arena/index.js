import { ambiences } from '../../assets/ambiences'
import {
  addScript,
  createItem,
  items,
  markAsUsed,
  moveTo,
} from '../../assets/items'
import { textures } from '../../assets/textures'
import { HFLIP, VFLIP } from '../../constants'
import { identity } from '../../faux-ramda'
import {
  addLight,
  addZone,
  circleOfVectors,
  finalize,
  generateBlankMapData,
  movePlayerTo,
  pickRandom,
  randomBetween,
  saveToDisk,
  setColor,
  setTexture,
} from '../../helpers'
import { plain, wall } from '../../prefabs'
import { getInjections } from '../../scripting'
import { overridePlayerScript } from '../shared/player'
import { hideMinimap } from '../shared/reset'
import { createGungameController } from './gamemodes/gungame'
import { createNPC, defineNPC } from './items/npc'
import { createRespawnController } from './items/respawnController'

const createWelcomeMarker = (pos, config) => {
  const ref = createItem(items.marker)

  hideMinimap(config.levelIdx, ref)

  addScript((self) => {
    return `
// component: welcomeMarker
ON INIT {
  ${getInjections('init', self)}
  SETCONTROLLEDZONE palette0
  ACCEPT
}

ON CONTROLLEDZONE_ENTER {
  TELEPORT -p self
  ACCEPT
}
    `
  }, ref)

  moveTo({ type: 'relative', coords: pos }, [0, 0, 0], ref)
  markAsUsed(ref)

  return ref
}

const generate = async (config) => {
  const { origin } = config

  const mapData = generateBlankMapData(config)
  mapData.meta.mapName = 'Arena'

  movePlayerTo(
    {
      type: 'relative',
      coords: [-origin.coords[0], -origin.coords[1], -origin.coords[2]],
    },
    mapData,
  )

  setColor('#223340', mapData)
  addZone(
    {
      type: 'relative',
      coords: [-origin.coords[0], -origin.coords[1], -origin.coords[2]],
    },
    [100, 0, 100],
    'palette0',
    ambiences.none,
    5000,
  )(mapData)

  setColor('#a7a7a7', mapData)
  setTexture(textures.stone.humanAkbaaPavingF, mapData)

  plain([0, 0, 0], 20, 'floor', identity, () => ({
    quad: pickRandom([0, 1, 2, 3]),
    textureRotation: pickRandom([0, 90, 180, 270]),
    textureFlags: pickRandom([0, HFLIP, VFLIP, HFLIP | VFLIP]),
  }))(mapData)

  // -------------------

  const building = (x, z, width, height, depth, mapData) => {
    let y = 30

    wall(
      [x - (width / 2) * 100 - 100, y, z + (depth / 2) * 100],
      'front',
      { width: width, height: height, unit: 100 },
      mapData,
    )
    wall(
      [x - (width / 2) * 100 - 100, y, z - (depth / 2) * 100],
      'back',
      { width: width, height: height, unit: 100 },
      mapData,
    )
    wall(
      [x - (width / 2) * 100, y, z - (depth / 2) * 100 - 100],
      'left',
      { width: depth, height: height, unit: 100 },
      mapData,
    )
    wall(
      [x + (width / 2) * 100, y, z - (depth / 2) * 100 - 100],
      'right',
      { width: depth, height: height, unit: 100 },
      mapData,
    )
  }

  setColor('#777777', mapData)
  setTexture(textures.stone.templeWall[0], mapData)

  let x = -900
  let z = 700

  let prevSizeX = 0
  let currSizeX = 3
  let currSizeY = 5
  let currSizeZ = 3

  building(x, z, currSizeX, currSizeY, currSizeZ, mapData)

  for (let i = 0; i < 6; i++) {
    prevSizeX = currSizeX
    currSizeX = pickRandom([2, 4, 6])
    currSizeY = randomBetween(3, 10 - currSizeX)
    currSizeZ = randomBetween(1, 2)
    x += prevSizeX * 50 + currSizeX * 50
    // calculation of walls is still not okay, when width or depth is not even
    building(
      x,
      z + randomBetween(-100, 300),
      currSizeX,
      currSizeY,
      currSizeZ,
      mapData,
    )
  }

  // setTexture(textures.stone.templeWall[2], mapData)
  // building(-725, 1120, 1, 4, 3, mapData)

  // -------------------

  setColor('white', mapData)
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

  const gungameCtrl = createGungameController({
    type: 'relative',
    coords: [-10, 0, -10],
  })

  const numberOfBots = 10

  const respawnCtrl = createRespawnController(
    [10, 0, 10],
    numberOfBots,
    gungameCtrl,
  )

  overridePlayerScript({
    __injections: {
      die: [`sendevent killed ${respawnCtrl.ref} "player ~^sender~"`, 'refuse'],
    },
  })

  defineNPC({
    __injections: {
      die: [`sendevent killed ${respawnCtrl.ref} "~^me~ ~^sender~"`],
    },
  })

  const welcomeMaker = createWelcomeMarker([0, 0, 0], config)

  const bots = circleOfVectors([0, 0, 0], 300, numberOfBots).map((pos, i) => {
    return createNPC(
      { type: 'relative', coords: pos },
      [0, 180 - i * Math.floor(360 / numberOfBots), 0],
      {
        type: pickRandom(['rebel guard', 'arx guard']),
        groups: ['bot'],
      },
    )
  })

  const finalizedMapData = finalize(mapData)
  return saveToDisk(finalizedMapData)
}

export default generate
