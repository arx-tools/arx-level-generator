import path from 'node:path'
import seedrandom from 'seedrandom'
import { ArxMap } from '@src/ArxMap.js'
import { Color } from '@src/Color.js'
import { Vector3 } from '@src/Vector3.js'
import { loadRooms } from '@prefabs/rooms/loadRooms.js'
import { createZone } from '@tools/createZone.js'

export default async () => {
  const {
    OUTPUTDIR = path.resolve('./dist'),
    LEVEL = '1',
    SEED = Math.floor(Math.random() * 1e20).toString(),
  } = process.env

  seedrandom(SEED, { global: true })
  console.log(`seed: ${SEED}`)

  const map = new ArxMap()
  map.meta.mapName = 'Escape from office'
  map.meta.seed = SEED
  map.config.offset = new Vector3(6000, 0, 6000)
  map.player.position.adjustToPlayerHeight()
  map.player.withScript()
  map.hud.hide('all')

  // --------------

  const rooms = await loadRooms('projects/escape-from-office/escape-from-office.rooms')
  rooms.forEach((room) => {
    map.add(room, true)
  })

  const spawnZone = createZone({
    position: new Vector3(0, 10, 0),
    name: 'spawn',
    backgroundColor: Color.fromCSS('skyblue'),
  })

  const zones = [spawnZone]

  // --------------

  map.zones.push(...zones)
  // map.lights.push(...lights)

  map.finalize()
  map.saveToDisk(OUTPUTDIR, parseInt(LEVEL))
}
