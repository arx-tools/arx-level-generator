import { Texture } from '@src/Texture.js'
import { Vector3 } from '@src/Vector3.js'
import { Cursor } from '@prefabs/rooms/Cursor.js'
import { Rooms } from '@prefabs/rooms/Rooms.js'
import { RoomProps } from '@prefabs/rooms/room.js'

const dummyRoom: RoomProps = {
  textures: {
    wall: Texture.missingTexture,
    floor: Texture.missingTexture,
    ceiling: Texture.missingTexture,
  },
}

export const createHouse = async () => {
  const cursor = new Cursor()
  const rooms = new Rooms(cursor)

  await rooms.addRoom(new Vector3(500, 300, 500), dummyRoom)
  await rooms.addRoom(new Vector3(200, 200, 200), dummyRoom, 'z++', 'y-')

  rooms.unionAll()

  return rooms
}
