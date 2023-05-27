import path from 'node:path'
import seedrandom from 'seedrandom'
import { ArxMap } from '@src/ArxMap.js'
import { Vector3 } from '@src/Vector3.js'
// import { Box3 } from 'three'
// import { Color } from '@src/Color.js'

export default async () => {
  const {
    OUTPUTDIR = path.resolve('./dist'),
    LEVEL = '1',
    SEED = Math.floor(Math.random() * 1e20).toString(),
  } = process.env

  seedrandom(SEED, { global: true })
  console.log(`seed: ${SEED}`)

  const map = await ArxMap.fromOriginalLevel(2)
  map.meta.mapName = 'Joined goblin levels'
  map.meta.seed = SEED

  const map2 = await ArxMap.fromOriginalLevel(15)
  map2.adjustOffsetTo(map)

  /*
  const box = new Box3(new Vector3(10348, 9, 9036), new Vector3(12004, 950, 9544))
  box = toArxCoordinateSystem(box)
  map2.polygons
    .filter((polygon) => polygon.isPartiallyWithin(box))
    .forEach((polygon) => {
      // polygon.setColor(Color.red)

      const idx = map2.polygons.indexOf(polygon)
      map2.polygons.splice(idx, 1)

      // polygon.move(new Vector3(0, 0, 200))
    })
  */

  map.add(map2)

  map.zones = []
  map.entities.empty()

  map.player.position.add(new Vector3(0, -60, 0))

  // porticullis_0085.move 80 0 0
  const portcullis = map.entities.find((entity) => {
    return entity.src.endsWith('porticullis') && entity.id === 85
  })
  if (typeof portcullis !== 'undefined') {
    portcullis.position.add(new Vector3(80, 0, 0))
  }

  map.removePortals()

  map.finalize()

  map.saveToDisk(OUTPUTDIR, parseInt(LEVEL))
}
