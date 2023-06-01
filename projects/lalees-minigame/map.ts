import { Texture } from '@src/Texture.js'
import { Vector3 } from '@src/Vector3.js'
import { Cursor } from '@prefabs/rooms/Cursor.js'
import { Rooms } from '@prefabs/rooms/Rooms.js'
import { RoomProps } from '@prefabs/rooms/room.js'
import { carpet, granite } from './materials.js'

const mainHall: RoomProps = {
  textures: {
    wall: Texture.stoneHumanPaving,
    floor: carpet,
    ceiling: Texture.stoneGroundCavesWet05,
  },
}

const bathroom: RoomProps = {
  textures: {
    wall: Texture.stoneHumanPaving,
    floor: granite,
    ceiling: Texture.itemCheese,
  },
}

export const createHouse = async () => {
  const cursor = new Cursor()
  const rooms = new Rooms(cursor)

  await rooms.addRoom(new Vector3(500, 300, 500), mainHall)
  await rooms.addRoom(new Vector3(200, 200, 200), bathroom, 'z++', 'y-')

  rooms.unionAll()

  return rooms
}
