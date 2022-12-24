import path from 'node:path'
import { ArxMap } from './ArxMap'
// import { Vector3 } from './Vector3'

// ....
;(async () => {
  const { OUTPUTDIR = path.resolve(__dirname, './dist'), LEVEL = '1' } = process.env

  const map = await ArxMap.loadLevel(1)

  map.dlf.interactiveObjects = []

  // TODO: this isn't working
  // map.setPlayerSpawn(new Vector3(2000, 0, 2000))

  // -------------------

  map.removePortals()

  map.finalize()

  map.saveToDisk(OUTPUTDIR, parseInt(LEVEL))
})()
