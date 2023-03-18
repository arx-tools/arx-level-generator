import fs from 'node:fs'
import path from 'node:path'
import { EdgesGeometry, MathUtils, Shape, ShapeGeometry } from 'three'
import seedrandom from 'seedrandom'
import { ArxMap } from '@src/ArxMap'
import { Vector3 } from '@src/Vector3'
import { Zone } from '@src/Zone'
import { Ambience } from '@src/Ambience'
import { carpet, ceilingTile, wallpaper, wallpaperDotted, whiteMosaicTiles } from '@projects/the-backrooms/materials'
import { HudElements } from '@src/HUD'
import { Rooms } from './Rooms'
import { RoomProps } from './room'
import { Texture } from '@src/Texture'
import { Cursor, CursorDir } from './Cursor'
import { Zones } from './Zones'
import { createLight } from './light'

export default async () => {
  const {
    OUTPUTDIR = path.resolve('./dist'),
    LEVEL = '1',
    SEED = Math.floor(Math.random() * 1e20).toString(),
  } = process.env

  seedrandom(SEED, { global: true })
  console.log(`seed: ${SEED}`)

  // ---------------

  const office: RoomProps = {
    hasMold: true,
    textures: {
      wall: wallpaper,
      floor: carpet,
      ceiling: ceilingTile,
    },
  }
  /*
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

  const defaultMap = path.resolve('assets/projects/the-backrooms/maps/default.ini')
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
            hasMold: false,
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
              const light = createLight(
                new Vector3(cursor.cursor.x, cursor.cursor.y - cursor.newSize.y / 2, cursor.cursor.z),
                Math.min(cursor.newSize.x, cursor.newSize.y, cursor.newSize.z) * 1.3,
              )
              rooms.currentRoom.lights.push(light)
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
  map.hud.hide(HudElements.Minimap)

  rooms.forEach((room) => {
    map.add(room, true)
  })
  zones.forEach((zone) => {
    map.zones.push(zone)
  })

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
