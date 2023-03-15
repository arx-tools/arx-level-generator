import path from 'node:path'
import { EdgesGeometry, MathUtils, Shape, ShapeGeometry } from 'three'
import seedrandom from 'seedrandom'
import { ArxMap } from '@src/ArxMap'
import { Vector3 } from '@src/Vector3'
import { Zone } from '@src/Zone'
import { Ambience } from '@src/Ambience'
import { carpet, ceilingTile, wallpaper, wallpaperDotted, whiteMosaicTiles } from '@projects/the-backrooms/materials'
import { HudElements } from '@src/HUD'
import { Rooms } from './rooms'
import { RoomTextures } from './room'
import { Texture } from '@src/Texture'

export default async () => {
  const {
    OUTPUTDIR = path.resolve('./dist'),
    LEVEL = '1',
    SEED = Math.floor(Math.random() * 1e20).toString(),
  } = process.env

  seedrandom(SEED, { global: true })
  console.log(`seed: ${SEED}`)

  // ---------------

  const roomType1: RoomTextures = { wall: wallpaper, floor: carpet, ceiling: ceilingTile }
  const roomType2: RoomTextures = { wall: wallpaperDotted, floor: carpet, ceiling: ceilingTile }
  const poolRoom: RoomTextures = { wall: whiteMosaicTiles, floor: whiteMosaicTiles, ceiling: whiteMosaicTiles }
  const water: RoomTextures = {
    wall: Texture.waterCavewater,
    floor: Texture.waterCavewater,
    ceiling: Texture.waterCavewater,
  }

  const rooms = new Rooms()

  await rooms.addRoom(new Vector3(800, 500, 1000), roomType1)
  rooms.saveCursorAs('spawn')
  await rooms.addRoom(new Vector3(200, 300, 400), roomType2, 'z++')
  await rooms.addRoom(new Vector3(600, 400, 600), roomType1, 'z++')
  rooms.saveCursorAs('branch point')
  await rooms.addRoom(new Vector3(1000, 300, 200), roomType2, 'x--')
  await rooms.addRoom(new Vector3(400, 400, 400), roomType1, 'x--')
  await rooms.addRoom(new Vector3(200, 200, 200), roomType1, 'y', 'z--')
  rooms.saveCursorAs('pool room')
  // TODO: turn off mold for pool room
  await rooms.addRoom(new Vector3(800, 400, 800), poolRoom, 'y', 'z--')
  await rooms.addRoom(new Vector3(600, 100, 600), poolRoom, 'y--')
  // TODO: water
  // await rooms.addRoom(new Vector3(600, 1, 600), water, 'y+', 'x', 'z')

  rooms.restoreCursor('branch point')
  await rooms.addRoom(new Vector3(1000, 300, 200), roomType2, 'x++')
  await rooms.addRoom(new Vector3(400, 400, 400), roomType1, 'x++')

  const map = new ArxMap()
  map.meta.mapName = 'The Backrooms'
  map.meta.seed = SEED
  map.config.offset = new Vector3(6000, 0, 6000)
  map.player.position.adjustToPlayerHeight()
  map.hud.hide(HudElements.Minimap)

  rooms.forEach((room) => {
    map.add(room, true)
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
