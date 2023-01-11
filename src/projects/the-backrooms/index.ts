import path from 'node:path'
import seedrandom from 'seedrandom'
import { ArxMap } from '@src/ArxMap'
import { Color } from '@src/Color'
import { Vector3 } from '@src/Vector3'
import { Light } from '@src/Light'
import { createRoom } from './room'

export default async () => {
  const {
    OUTPUTDIR = path.resolve(__dirname, './dist'),
    LEVEL = '1',
    SEED = Math.floor(Math.random() * 1e20).toString(),
  } = process.env

  seedrandom(SEED, { global: true })
  console.log(`seed: ${SEED}`)

  const map = new ArxMap()

  map.config.offset = new Vector3(1000, 0, 1000)
  map.player.position.adjustToPlayerHeight()
  map.hideMinimap()

  const room1 = await createRoom(800, 400, 800)
  // const room2 = await createRoom(600, 300, 800)
  // room2.move(new Vector3(200, 0, 500))

  // TODO: union(room1, room2) ?

  map.add(room1, true)
  // map.add(room2, true)

  const light = new Light({
    color: Color.yellow.lighten(50),
    position: new Vector3(0, -800, 0),
    fallStart: 100,
    fallEnd: 1000,
    intensity: 2,
    lightData: {
      exFlicker: Color.transparent,
      exRadius: 0,
      exFrequency: 0,
      exSize: 0,
      exSpeed: 0,
      exFlareSize: 0,
    },
  })

  map.lights.push(light)

  map.finalize()

  map.saveToDisk(OUTPUTDIR, parseInt(LEVEL))
}
