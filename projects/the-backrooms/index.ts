import path from 'node:path'
import { ArxPolygonFlags } from 'arx-convert/types'
import seedrandom from 'seedrandom'
import { Vector2 } from 'three'
import { ArxMap } from '@src/ArxMap.js'
import { HudElements } from '@src/HUD.js'
import { Material } from '@src/Material.js'
import { DONT_QUADIFY, SHADING_SMOOTH } from '@src/Polygons.js'
import { Texture } from '@src/Texture.js'
import { Vector3 } from '@src/Vector3.js'
import { applyTransformations } from '@src/helpers.js'
import { createPlaneMesh } from '@prefabs/mesh/plane.js'
import { loadRooms } from '@prefabs/rooms/loadRooms.js'

export default async () => {
  const {
    OUTPUTDIR = path.resolve('./dist'),
    LEVEL = '1',
    SEED = Math.floor(Math.random() * 1e20).toString(),
  } = process.env

  seedrandom(SEED, { global: true })
  console.log(`seed: ${SEED}`)

  const map = new ArxMap()
  map.meta.mapName = 'The Backrooms'
  map.meta.seed = SEED
  map.config.offset = new Vector3(6000, 0, 6000)
  map.player.position.adjustToPlayerHeight()
  map.player.withScript()
  /*
  map.player.script?.on('init', () => {
    // TODO: load the item from the CableDrum class
    const item = 'provisions/cable_drum/cable_drum'
    // TODO: export the entity as root item
    return `
      inventory playeradd ${item}
      inventory playeradd ${item}
    `
  })
  */
  map.hud.hide(HudElements.Minimap)
  await map.i18n.addFromFile('projects/the-backrooms/i18n.json')

  const rooms = await loadRooms('projects/the-backrooms/the-backrooms.rooms')
  rooms.forEach((room) => {
    map.add(room, true)
  })

  const water = createPlaneMesh({
    size: new Vector2(600, 2100),
    texture: Material.fromTexture(Texture.waterCavewater, {
      flags: ArxPolygonFlags.Water | ArxPolygonFlags.NoShadow,
      opacity: 80,
    }),
  })
  water.translateX(-1500)
  water.translateY(30)
  water.translateZ(-350)
  applyTransformations(water)
  water.translateX(map.config.offset.x)
  water.translateY(map.config.offset.y)
  water.translateZ(map.config.offset.z)
  applyTransformations(water)
  map.polygons.addThreeJsMesh(water, { tryToQuadify: DONT_QUADIFY, shading: SHADING_SMOOTH })

  // ---------------

  /*
  const key = Entity.key
  key.position = new Vector3(randomBetween(-100, 100), -10, randomBetween(-100, 100))

  const door = new FireExitDoor({
    position: new Vector3(0, -200, 0),
    isLocked: true,
    lockpickDifficulty: 100,
  })
  door.setKey(key)

  map.entities.push(door, key)
  */

  // ---------------

  // const slot = Entity.powerStonePlace.withScript()
  // slot.position = new Vector3(-400, -150, 345)
  // slot.orientation = new Rotation(0, MathUtils.degToRad(90), 0)

  // const stoneInSlot = Entity.powerStone.withScript()
  // stoneInSlot.script?.properties.push(Interactivity.off)
  // stoneInSlot.position = slot.position.clone().add(new Vector3(-21, -13, 13))
  // stoneInSlot.orientation = new Rotation(0, 0, MathUtils.degToRad(-90))

  // const lock = Entity.lock.withScript()
  // lock.position = new Vector3(-150, -162, 500)
  // lock.orientation = new Rotation(0, MathUtils.degToRad(-90), 0)
  // lock.script?.properties.push(new Label('[lock--card-reader]'))

  // const door = new FireExitDoor({
  //   position: new Vector3(100, 0, 510),
  //   orientation: new Rotation(0, MathUtils.degToRad(-90), 0),
  //   isLocked: false,
  //   lockpickDifficulty: 100,
  // })

  // // const key = Entity.key

  // const mountedWire1 = new WallmountedWire({
  //   position: new Vector3(-157, -162, 502),
  //   orientation: new Rotation(0, MathUtils.degToRad(-155), MathUtils.degToRad(10)),
  // })
  // mountedWire1.isMounted = false

  // const mountedWire2 = new WallmountedWire({
  //   position: new Vector3(-287, -162, 502),
  //   orientation: new Rotation(0, MathUtils.degToRad(-155), MathUtils.degToRad(10)),
  // })
  // mountedWire2.isMounted = true
  // const mountedWire3 = new WallmountedWire({
  //   position: new Vector3(-402, -161, 502),
  //   orientation: new Rotation(MathUtils.degToRad(10), MathUtils.degToRad(-65), MathUtils.degToRad(10)),
  // })
  // mountedWire3.isMounted = false

  /*
  const rootCableDrum = new CableDrum()
  rootCableDrum.script?.makeIntoRoot()
  */

  // const wires = [mountedWire1, mountedWire2, mountedWire3]

  // map.entities.push(slot, stoneInSlot, lock, door, /*key,*/ ...wires /*, rootCableDrum*/)

  // for (let i = 0; i < 10; i++) {
  //   const cube = new Cube({
  //     position: new Vector3(i * 100, -10, i * 100)
  //   })
  //   cube.withScript()
  //   cube.script?.properties.push(new Scale(0.3 * i + 0.01))
  //   cube.script?.on('initend', new TweakSkin(Texture.stoneGroundCavesWet05, Texture.l1DragonIceGround08))
  //   cube.script?.on('init', () => {
  //     return `collision on`
  //   })
  //   map.entities.push(cube)
  // }

  // sfx/mloop2.wav - machine sound

  /*
  // lock

  // slot:
  ON INIT {
    SET §power 0
    SETNAME [description_power_slot]
    SET_MATERIAL METAL
    ACCEPT
  }

  ON COMBINE {
    IF (§power == 1) ACCEPT
    IF (^$PARAM1 ISCLASS "POWER_STONE") {
      SENDEVENT CUSTOM ^$PARAM1 "INSLOT"
      PLAY "Clip"
      SET §power 1
      SENDEVENT CUSTOM Timed_lever_0052 "NRJ"
      SENDEVENT CUSTOM POWER_STONE_0034 "UNHIDE"
      ACCEPT
    }
  ACCEPT
  }

  // -------------

  // stone:
  ON INIT {
    SETNAME [description_power_stone]
    SET_MATERIAL GLASS
    //SET_GROUP PROVISIONS
    //SET_PRICE 1250
    PLAYERSTACKSIZE 10
    SET_STEAL 50
    SET_WEIGHT 1
    ACCEPT
  }  
  ON CUSTOM {  
    IF (^$PARAM1 == "INSLOT") DESTROY SELF
    ACCEPT
  }
  */

  map.finalize()

  map.saveToDisk(OUTPUTDIR, parseInt(LEVEL))
}
