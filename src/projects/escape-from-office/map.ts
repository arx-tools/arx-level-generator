import { Cursor } from '@projects/the-backrooms/Cursor.js'
import { Rooms } from '@projects/the-backrooms/Rooms.js'
import { RoomProps } from '@projects/the-backrooms/room.js'
import { fakeWoodTiles, officeCeiling, officeWalls } from './materials.js'
import { Vector3 } from '@src/Vector3.js'
import { Texture } from '@src/Texture.js'
import { Material } from '@src/Material.js'
import { ArxPolygonFlags } from 'arx-convert/types'

const office: RoomProps = {
  hasMold: false,
  textures: {
    wall: officeWalls,
    floor: fakeWoodTiles,
    ceiling: officeCeiling,
  },
}

const doorFrame: RoomProps = {
  hasMold: false,
  textures: {
    wall: officeWalls,
    floor: fakeWoodTiles,
    ceiling: officeWalls,
  },
}

const windowFrame: RoomProps = {
  hasMold: false,
  textures: {
    wall: [officeWalls, officeWalls, Texture.alpha, officeWalls],
    floor: officeWalls,
    ceiling: officeWalls,
  },
}

const invisible: RoomProps = {
  hasMold: false,
  textures: {
    wall: Texture.alpha,
    floor: Texture.alpha,
    ceiling: Texture.alpha,
  },
}

export const createRooms = async () => {
  const cursor = new Cursor()
  const rooms = new Rooms(cursor)

  await rooms.addRoom(new Vector3(500, 300, 500), office)
  cursor.saveAs('first-room')
  await rooms.addRoom(new Vector3(200, 250, 20), doorFrame, 'y-', 'z++')
  await rooms.addRoom(new Vector3(1000, 300, 300), office, 'y-', 'z++')
  cursor.saveAs('corridor')
  await rooms.addRoom(new Vector3(200, 250, 20), doorFrame, 'y-', 'z++')
  await rooms.addRoom(new Vector3(500, 300, 500), office, 'y-', 'z++')
  cursor.restore('first-room')
  await rooms.addRoom(new Vector3(100, 100, 100), invisible, 'y++')
  cursor.restore('first-room')
  await rooms.addRoom(new Vector3(100, 200, 20), windowFrame, 'y', 'z--')
  await rooms.addRoom(new Vector3(400, 200, 20), invisible, 'y', 'z--')
  cursor.saveAs('window-helper')
  await rooms.addRoom(new Vector3(100, 200, 20), windowFrame, 'y', 'z++', 'x-')
  cursor.restore('window-helper')
  await rooms.addRoom(new Vector3(100, 200, 20), windowFrame, 'y', 'z++', 'x+')

  rooms.unionAll()

  return rooms
}
