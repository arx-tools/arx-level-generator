import path from 'node:path'
import { ArxMap } from './ArxMap'
import { Vector3 } from './Vector3'

// ....
;(async () => {
  const { OUTPUTDIR = path.resolve(__dirname, './dist'), LEVEL = '1' } = process.env

  const map = await ArxMap.loadLevel(2)

  const map2 = await ArxMap.loadLevel(15)
  map2.alignPolygonsTo(map)
  map.add(map2)

  map.zones = []

  // porticullis_0085.move 80 0 0
  const portcullis = map.entities.find((entity) => {
    return entity.name.toLowerCase().includes('porticullis') && entity.id === 85
  })
  if (typeof portcullis !== 'undefined') {
    portcullis.position.add(new Vector3(80, 0, 0))
  }

  map.removePortals()

  map.finalize()

  map.saveToDisk(OUTPUTDIR, parseInt(LEVEL))
})()
