import { Texture } from '@src/Texture.js'
import { Vector3 } from '@src/Vector3.js'
import { Cursor } from '@prefabs/rooms/Cursor.js'
import { Rooms } from '@prefabs/rooms/Rooms.js'
import { RoomProps } from '@prefabs/rooms/room.js'
import { fakeWoodTiles, officeCeiling, officeWalls } from './materials.js'

const office: RoomProps = {
  textures: {
    wall: officeWalls,
    floor: fakeWoodTiles,
    ceiling: officeCeiling,
  },
}

const corridor: RoomProps = {
  textures: {
    wall: officeWalls,
    floor: fakeWoodTiles,
    ceiling: officeCeiling,
  },
}

const doorFrame: RoomProps = {
  textures: {
    wall: officeWalls,
    floor: fakeWoodTiles,
    ceiling: officeWalls,
  },
}

const windowFrame: RoomProps = {
  textures: {
    wall: officeWalls,
    floor: officeWalls,
    ceiling: officeWalls,
  },
}

const invisible: RoomProps = {
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
  cursor.saveAs('1st-room')
  await rooms.addRoom(new Vector3(200, 250, 20), doorFrame, 'y-', 'z++')
  await rooms.addRoom(new Vector3(1000, 300, 300), corridor, 'y-', 'z++')
  cursor.saveAs('corridor')
  await rooms.addRoom(new Vector3(200, 250, 20), doorFrame, 'y-', 'z++')
  await rooms.addRoom(new Vector3(500, 300, 500), office, 'y-', 'z++')
  cursor.saveAs('2nd-room')
  await rooms.addRoom(new Vector3(100, 100, 100), invisible, 'y++')
  cursor.restore('1st-room')
  await rooms.addRoom(new Vector3(100, 100, 100), invisible, 'y++')
  cursor.restore('1st-room')
  await rooms.addRoom(new Vector3(100, 200, 20), windowFrame, 'y', 'z--')
  await rooms.addRoom(new Vector3(400, 200, 20), invisible, 'y', 'z--')
  cursor.saveAs('window-helper')
  await rooms.addRoom(new Vector3(100, 200, 20), windowFrame, 'y', 'z++', 'x-')
  cursor.restore('window-helper')
  await rooms.addRoom(new Vector3(100, 200, 20), windowFrame, 'y', 'z++', 'x+')
  cursor.restore('2nd-room')
  await rooms.addRoom(new Vector3(100, 200, 20), windowFrame, 'y', 'z++')
  await rooms.addRoom(new Vector3(400, 200, 20), invisible, 'y', 'z++')
  cursor.saveAs('window-helper')
  await rooms.addRoom(new Vector3(100, 200, 20), windowFrame, 'y', 'z--', 'x-')
  cursor.restore('window-helper')
  await rooms.addRoom(new Vector3(100, 200, 20), windowFrame, 'y', 'z--', 'x+')

  cursor.restore('corridor')
  await rooms.addRoom(new Vector3(1000, 300, 300), corridor, 'y-', 'x++')

  rooms.unionAll()

  return rooms
}
