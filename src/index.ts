import path from 'node:path'
import { ArxMap } from './ArxMap'

// ....
;(async () => {
  const { OUTPUTDIR = path.resolve(__dirname, './dist'), LEVEL = '1' } = process.env

  const map = await ArxMap.loadLevel(2)
  const map2 = await ArxMap.loadLevel(15)

  // TODO: move all polygons via scenePosition when loading?

  map2.move(map.scenePosition.clone().sub(map2.scenePosition))
  map.add(map2)

  // TODO: porticullis_0085.move 80 0 0

  map.removePortals()

  map.finalize()

  map.saveToDisk(OUTPUTDIR, parseInt(LEVEL))
})()
