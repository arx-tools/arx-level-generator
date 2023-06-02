import fs from 'node:fs'
import path from 'node:path'
import seedrandom from 'seedrandom'
import { EdgesGeometry, MathUtils, Shape, ShapeGeometry } from 'three'
import { Ambience } from '@src/Ambience.js'
import { ArxMap } from '@src/ArxMap.js'
import { Entity } from '@src/Entity.js'
import { HudElements } from '@src/HUD.js'
import { Rotation } from '@src/Rotation.js'
import { Texture } from '@src/Texture.js'
import { Vector3 } from '@src/Vector3.js'
import { Zone } from '@src/Zone.js'
import { randomBetween } from '@src/random.js'
import { Cube } from '@prefabs/entity/Cube.js'
import { Cursor, CursorDir } from '@prefabs/rooms/Cursor.js'
import { Rooms } from '@prefabs/rooms/Rooms.js'
import { RoomProps } from '@prefabs/rooms/room.js'
import { carpet, ceilingTile, wallpaper, wallpaperDotted, whiteMosaicTiles } from '@projects/the-backrooms/materials.js'
// import { CableDrum } from './CableDrum.js'
import { TweakSkin } from '@scripting/commands/TweakSkin.js'
import { Interactivity } from '@scripting/properties/Interactivity.js'
import { Label } from '@scripting/properties/Label.js'
import { Transparency } from '@scripting/properties/Transparency.js'
import { createLight } from '@tools/createLight.js'
import { FireExitDoor } from './FireExitDoor.js'
import { WallmountedWire } from './WallmountedWire.js'
import { Zones } from './Zones.js'

export default async () => {
  const {
    OUTPUTDIR = path.resolve('./dist'),
    LEVEL = '1',
    SEED = Math.floor(Math.random() * 1e20).toString(),
  } = process.env

  seedrandom(SEED, { global: true })
  console.log(`seed: ${SEED}`)

  // ---------------

  /*
  const office: RoomProps = {
    hasMold: true,
    textures: {
      wall: wallpaper,
      floor: carpet,
      ceiling: ceilingTile,
    },
  }
  const officeDotted: RoomProps = {
    hasMold: true,
    textures: {
      wall: wallpaperDotted,
      floor: carpet,
      ceiling: ceilingTile,
    },
  }
  const pool: RoomProps = {
    hasMold: false,
    textures: {
      wall: whiteMosaicTiles,
      floor: whiteMosaicTiles,
      ceiling: whiteMosaicTiles,
    },
  }
  const brokenWall: RoomProps = {
    hasMold: false,
    textures: {
      wall: Texture.l1TempleStoneWall03,
      floor: Texture.l1TempleStoneWall03,
      ceiling: Texture.l1TempleStoneWall03,
    },
  }
  */

  const cursor = new Cursor()
  const rooms = new Rooms(cursor)
  const zones = new Zones(cursor)
  const roomDefinitions: Record<string, RoomProps> = {}

  const defaultMap = path.resolve('assets/projects/the-backrooms/default.rooms')
  const rawInput = await fs.promises.readFile(defaultMap, 'utf-8')

  const lines = rawInput.split(/\r?\n/)

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    if (line.startsWith('#') || line === '') {
      continue
    }

    const tokens = line.split(' ')

    switch (tokens[0]) {
      case 'define':
        // TODO: validate arguments
        const definitionName = tokens[1]
        if (typeof roomDefinitions[definitionName] === 'undefined') {
          roomDefinitions[definitionName] = {
            textures: {
              ceiling: Texture.aliciaRoomMur02,
              wall: Texture.aliciaRoomMur02,
              floor: Texture.aliciaRoomMur02,
            },
          }
        }
        switch (tokens[2]) {
          case 'floor':
          case 'wall':
          case 'ceiling':
            roomDefinitions[definitionName].textures[tokens[2]] = new Texture({ filename: tokens[3], size: 128 })
            break
          default:
          // TODO
        }
        break
      case 'room':
        switch (tokens[1]) {
          case 'add':
            // TODO: validate arguments
            await rooms.addRoom(
              new Vector3(parseInt(tokens[2]), parseInt(tokens[3]), parseInt(tokens[4])),
              roomDefinitions[tokens[5]],
              ...(tokens.slice(6) as CursorDir[]),
            )
            break
          default:
            console.error(`Unknown parameter "${tokens[1]}" after "room" at line ${i + 1}`)
        }
        break
      case 'with':
        switch (tokens[1]) {
          case 'light':
            if (rooms.currentRoom === undefined) {
              // TODO: error: only add light if there's at least 1 room
            } else {
              const lightSpacing = 200
              const xAmount = Math.floor(cursor.newSize.x / lightSpacing)
              const yAmount = Math.floor(cursor.newSize.y / lightSpacing)
              const zAmount = Math.floor(cursor.newSize.z / lightSpacing)
              for (let x = 0; x < xAmount; x++) {
                for (let y = 0; y < yAmount; y++) {
                  for (let z = 0; z < zAmount; z++) {
                    const light = createLight({
                      radius: lightSpacing * 1.3,
                      position: new Vector3(
                        cursor.cursor.x -
                          cursor.newSize.x / 2 +
                          x * lightSpacing +
                          lightSpacing / 2 +
                          randomBetween(-lightSpacing / 2, +lightSpacing / 2),
                        cursor.cursor.y -
                          y * lightSpacing -
                          lightSpacing / 2 -
                          randomBetween(-lightSpacing / 2, +lightSpacing / 2),
                        cursor.cursor.z -
                          cursor.newSize.z / 2 +
                          z * lightSpacing +
                          lightSpacing / 2 +
                          randomBetween(-lightSpacing / 2, +lightSpacing / 2),
                      ),
                    })
                    rooms.currentRoom.lights.push(light)
                  }
                }
              }
            }
            break
          default:
            console.error(`Unknown parameter "${tokens[1]}" after "with" at line ${i + 1}`)
        }
        break
      case 'cursor':
        switch (tokens[1]) {
          case 'save':
            // TODO: check if tokens[2] exists
            cursor.saveAs(tokens[2])
            break
          case 'restore':
            // TODO: check if tokens[2] exists
            cursor.restore(tokens[2])
            break
          default:
            console.error(`Unknown parameter "${tokens[1]}" after "cursor" at line ${i + 1}`)
        }
        break
      default:
        console.error(`Unknown command "${tokens[0]}" at line ${i + 1}`)
    }
  }

  /*
  await rooms.addRoom(new Vector3(800, 500, 1000), office)
  // add spawn zone: no ambience + draw distance = 3000
  // add light to the room's ceiling
  cursor.saveAs('spawn')
  await rooms.addRoom(new Vector3(200, 300, 400), officeDotted, 'z++')
  await rooms.addRoom(new Vector3(600, 400, 600), office, 'z++')
  cursor.saveAs('branch point')
  await rooms.addRoom(new Vector3(1000, 300, 200), officeDotted, 'x--')
  await rooms.addRoom(new Vector3(400, 400, 400), office, 'x--')

  // await rooms.addZone(new Vector3(200, Infinity, 100), { ambience: Ambience.none, name: 'pool-room-out', drawDistance: 3000 }, 'y-', 'z-')
  await rooms.addRoom(new Vector3(200, 200, 100), brokenWall, 'y', 'z--')
  // await rooms.addZone(new Vector3(200, Infinity, 100), { ambience: Ambience.caveB, name: 'pool-room-in', drawDistance: 1000 }, 'y', 'z--')

  // ----------------------------------

  await rooms.addRoom(new Vector3(1200, 400, 800), pool, 'y', 'z--')
  cursor.saveAs('1st pool')
  await rooms.addRoom(new Vector3(1200, 400, 100), pool, 'y', 'z--')
  cursor.saveAs('1st pool pillar margin')

  await rooms.addRoom(new Vector3(200, 400, 100), pool, 'x-', 'y', 'z--')
  cursor.restore('1st pool pillar margin')
  await rooms.addRoom(new Vector3(200, 400, 100), pool, 'x+', 'y', 'z--')
  cursor.restore('1st pool pillar margin')
  await rooms.addRoom(new Vector3(600, 400, 100), pool, 'y', 'z--')

  await rooms.addRoom(new Vector3(1200, 400, 600), pool, 'y', 'z--')
  cursor.saveAs('2nd pool pillar margin')
  await rooms.addRoom(new Vector3(200, 400, 100), pool, 'x-', 'y', 'z--')
  cursor.restore('2nd pool pillar margin')
  await rooms.addRoom(new Vector3(200, 400, 100), pool, 'x+', 'y', 'z--')
  cursor.restore('2nd pool pillar margin')
  await rooms.addRoom(new Vector3(600, 400, 100), pool, 'y', 'z--')

  await rooms.addRoom(new Vector3(1200, 400, 800), pool, 'y', 'z--')

  cursor.restore('1st pool')
  await rooms.addRoom(new Vector3(600, 100, 600), pool, 'y--', 'z-')
  await rooms.addRoom(new Vector3(400, 100, 300), pool, 'y-', 'z--')
  await rooms.addRoom(new Vector3(600, 100, 400), pool, 'y-', 'z--')
  cursor.saveAs('2nd pool')
  await rooms.addRoom(new Vector3(400, 100, 300), pool, 'y-', 'z--')
  await rooms.addRoom(new Vector3(600, 100, 500), pool, 'y-', 'z--')
  cursor.restore('2nd pool')
  await rooms.addRoom(new Vector3(400, 100, 200), pool, 'x++', 'y-')
  await rooms.addRoom(new Vector3(100, 300, 400), pool, 'x+', 'y++')
  await rooms.addRoom(new Vector3(200, 500, 200), pool, 'x++', 'y') // this 500 will cause an issue as it's odd
  cursor.saveAs('left pool')

  //cursor.restore('2nd pool')
  //await rooms.addRoom(new Vector3(400, 100, 200), pool, 'x--', 'y-')

  // ----------------------------------

  cursor.restore('branch point')
  await rooms.addRoom(new Vector3(1000, 300, 200), officeDotted, 'x++')
  await rooms.addRoom(new Vector3(400, 400, 400), office, 'x++')
  */

  rooms.unionAll()

  const map = new ArxMap()
  map.meta.mapName = 'The Backrooms'
  map.meta.seed = SEED
  map.config.offset = new Vector3(6000, 0, 6000)
  map.player.position.adjustToPlayerHeight()
  map.player.withScript()
  map.player.script?.on('init', () => {
    // TODO: load the item from the CableDrum class
    const item = 'provisions/cable_drum/cable_drum'
    // TODO: export the entity as root item
    return `
      inventory playeradd ${item}
      inventory playeradd ${item}
    `
  })
  map.hud.hide(HudElements.Minimap)
  await map.i18n.addFromFile('projects/the-backrooms/i18n.json')

  rooms.forEach((room) => {
    map.add(room, true)
  })
  zones.forEach((zone) => {
    map.zones.push(zone)
  })

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

  const slot = Entity.powerStonePlace.withScript()
  slot.position = new Vector3(-400, -150, 345)
  slot.orientation = new Rotation(0, MathUtils.degToRad(90), 0)

  const stoneInSlot = Entity.powerStone.withScript()
  stoneInSlot.script?.properties.push(Interactivity.off)
  stoneInSlot.position = slot.position.clone().add(new Vector3(-21, -13, 13))
  stoneInSlot.orientation = new Rotation(0, 0, MathUtils.degToRad(-90))

  const lock = Entity.lock.withScript()
  lock.position = new Vector3(-150, -162, 500)
  lock.orientation = new Rotation(0, MathUtils.degToRad(-90), 0)
  lock.script?.properties.push(new Label('[lock--card-reader]'))

  const door = new FireExitDoor({
    position: new Vector3(100, 0, 510),
    orientation: new Rotation(0, MathUtils.degToRad(-90), 0),
    isLocked: false,
    lockpickDifficulty: 100,
  })

  // const key = Entity.key

  const mountedWire1 = new WallmountedWire({
    position: new Vector3(-157, -162, 502),
    orientation: new Rotation(0, MathUtils.degToRad(-155), MathUtils.degToRad(10)),
  })
  mountedWire1.isMounted = false

  const mountedWire2 = new WallmountedWire({
    position: new Vector3(-287, -162, 502),
    orientation: new Rotation(0, MathUtils.degToRad(-155), MathUtils.degToRad(10)),
  })
  mountedWire2.isMounted = true
  const mountedWire3 = new WallmountedWire({
    position: new Vector3(-402, -161, 502),
    orientation: new Rotation(MathUtils.degToRad(10), MathUtils.degToRad(-65), MathUtils.degToRad(10)),
  })
  mountedWire3.isMounted = false

  /*
  const rootCableDrum = new CableDrum()
  rootCableDrum.script?.makeIntoRoot()
  */

  const wires = [mountedWire1, mountedWire2, mountedWire3]

  map.entities.push(slot, stoneInSlot, lock, door, /*key,*/ ...wires /*, rootCableDrum*/)

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

  // ---------------

  /*
  const shape = new Shape()
  shape.lineTo(100, 0)
  shape.lineTo(0, 100)
  shape.lineTo(0, 200)
  shape.lineTo(-200, 50)

  const geometry = new ShapeGeometry(shape)
  const edge = new EdgesGeometry(geometry)
  edge.rotateX(MathUtils.degToRad(70))

  // TODO: replace this with createZone()
  const zone = Zone.fromThreejsGeometry(edge, {
    name: 'spawn',
    ambience: Ambience.fromCustomAudio('loop_sirs', 'loop_sirs.wav'),
  })

  map.zones.push(zone)

  const shape2 = new Shape()
  shape2.lineTo(100, 0)
  shape2.lineTo(100, 100)
  shape2.lineTo(0, 100)

  const geometry2 = new ShapeGeometry(shape2)
  const edge2 = new EdgesGeometry(geometry2)
  edge2.rotateX(MathUtils.degToRad(90))
  edge2.translate(0, 0, 1100)

  const zone2 = Zone.fromThreejsGeometry(edge2, {
    name: 'other zone',
    ambience: Ambience.jailStress,
  })

  map.zones.push(zone2)
  */

  map.finalize()

  map.saveToDisk(OUTPUTDIR, parseInt(LEVEL))
}
