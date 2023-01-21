import { ArxMap } from '@src/ArxMap'
import { DONT_QUADIFY } from '@src/Polygons'
import { Vector3 } from '@src/Vector3'
import path from 'node:path'
import { MathUtils } from 'three'
import { wallpaper } from '../the-backrooms/materials'
import { createRoomFromMesh, createRoomMesh } from '../the-backrooms/room'

export default async () => {
  const { OUTPUTDIR = path.resolve(__dirname, './dist'), LEVEL = '1' } = process.env

  const map = new ArxMap()

  map.config.offset = new Vector3(2000, 0, 2000)
  map.player.position.adjustToPlayerHeight()
  map.player.orientation.y = MathUtils.degToRad(-90)
  map.hideMinimap()

  const roomMesh = await createRoomMesh(new Vector3(600, 400, 600), wallpaper)
  roomMesh.position.add(new Vector3(100, 0, 100))
  roomMesh.rotateZ(MathUtils.degToRad(20))
  map.add(await createRoomFromMesh(roomMesh, DONT_QUADIFY), true)

  map.finalize()

  map.saveToDisk(OUTPUTDIR, parseInt(LEVEL))
}
