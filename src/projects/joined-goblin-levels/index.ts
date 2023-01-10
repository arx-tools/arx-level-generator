import path from 'node:path'
import seedrandom from 'seedrandom'
import { ArxMap } from '../../ArxMap'
import { Vector3 } from '../../Vector3'

export default async () => {
  const {
    OUTPUTDIR = path.resolve(__dirname, './dist'),
    LEVEL = '1',
    SEED = Math.floor(Math.random() * 1e20).toString(),
  } = process.env

  seedrandom(SEED, { global: true })
  console.log(`seed: ${SEED}`)

  const map = await ArxMap.fromOriginalLevel(2)

  const map2 = await ArxMap.fromOriginalLevel(15)
  map.add(map2, true)

  map.zones = []

  // porticullis_0085.move 80 0 0
  const portcullis = map.entities.find((entity) => {
    return entity.name.endsWith('porticullis') && entity.id === 85
  })
  if (typeof portcullis !== 'undefined') {
    portcullis.position.add(new Vector3(80, 0, 0))
  }

  map.removePortals()

  map.finalize()

  map.saveToDisk(OUTPUTDIR, parseInt(LEVEL))
}
