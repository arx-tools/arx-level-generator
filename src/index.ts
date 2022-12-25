import path from 'node:path'
import { ArxMap } from './ArxMap'
import { Vector3 } from './Vector3'

// ....
;(async () => {
  const { OUTPUTDIR = path.resolve(__dirname, './dist'), LEVEL = '1' } = process.env

  const map = await ArxMap.loadLevel(2)
  const map2 = await ArxMap.loadLevel(15)

  map2.move(new Vector3(0, 160, 1800))
  map.add(map2)

  // map.dlf.interactiveObjects = []

  map.removePortals()

  map.finalize()

  map.saveToDisk(OUTPUTDIR, parseInt(LEVEL))
})()
