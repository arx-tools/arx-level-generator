import path from 'node:path'
import { MathUtils } from 'three'
import seedrandom from 'seedrandom'
import { ArxMap } from '@src/ArxMap'
import { HudElements } from '@src/HUD'
import { DONT_QUADIFY } from '@src/Polygons'
import { Vector3 } from '@src/Vector3'
import { carpet, ceilingTile, wallpaper } from '@projects/the-backrooms/materials'
import { createRoomFromMesh, createRoomMesh } from '@projects/the-backrooms/room'

export default async () => {
  const {
    OUTPUTDIR = path.resolve('./dist'),
    LEVEL = '1',
    SEED = Math.floor(Math.random() * 1e20).toString(),
  } = process.env

  seedrandom(SEED, { global: true })
  console.log(`seed: ${SEED}`)

  const map = new ArxMap()
  map.meta.mapName = 'Tilted room demo'
  map.meta.seed = SEED
  map.config.offset = new Vector3(2000, 0, 2000)
  map.player.position.adjustToPlayerHeight()
  map.player.orientation.y = MathUtils.degToRad(-90)
  map.hud.hide(HudElements.Minimap)

  const roomMesh = await createRoomMesh(new Vector3(600, 400, 600), {
    wall: wallpaper,
    floor: carpet,
    ceiling: ceilingTile,
  })
  roomMesh.position.add(new Vector3(100, 0, 100))
  roomMesh.rotateZ(MathUtils.degToRad(20))
  map.add(await createRoomFromMesh(roomMesh, DONT_QUADIFY), true)

  map.finalize()

  map.saveToDisk(OUTPUTDIR, parseInt(LEVEL))
}
