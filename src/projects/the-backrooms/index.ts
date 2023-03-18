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
import { Cursor } from './Cursor'
import { Zones } from './Zones'

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

  const cursor = new Cursor()
  const rooms = new Rooms(cursor)
  const zones = new Zones(cursor)

  await rooms.addRoom(new Vector3(800, 500, 1000), office)
  // add spawn zone: no ambience + draw distance = 3000
  // add light to the room's ceiling
  cursor.saveAs('spawn')
  await rooms.addRoom(new Vector3(200, 300, 400), officeDotted, 'z++')
  await rooms.addRoom(new Vector3(600, 400, 600), office, 'z++')
  cursor.saveAs('branch point')
  await rooms.addRoom(new Vector3(2000, 300, 200), officeDotted, 'x--')
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

  // const light = new Light({
  //   color: Color.yellow.lighten(50),
  //   position: new Vector3(0, -800, 0),
  //   fallStart: 100,
  //   fallEnd: 1000,
  //   intensity: 2,
  //   lightData: {
  //     exFlicker: Color.transparent,
  //     exRadius: 0,
  //     exFrequency: 0,
  //     exSize: 0,
  //     exSpeed: 0,
  //     exFlareSize: 0,
  //   },
  // })

  // map.lights.push(light)

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
