import { ArxMap } from '@src/ArxMap.js'
import { Vector3 } from '@src/Vector3.js'
import path from 'node:path'
import seedrandom from 'seedrandom'

export default async () => {
  const {
    OUTPUTDIR = path.resolve('./dist'),
    LEVEL = '1',
    SEED = Math.floor(Math.random() * 1e20).toString(),
  } = process.env

  seedrandom(SEED, { global: true })
  console.log(`seed: ${SEED}`)

  const map = new ArxMap()
  map.meta.mapName = 'The Forest'
  map.meta.seed = SEED
  map.config.offset = new Vector3(6000, 0, 6000)

  // TODO

  map.finalize()
  map.saveToDisk(OUTPUTDIR, parseInt(LEVEL))
}
