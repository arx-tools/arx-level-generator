import path from 'node:path'
import { ArxMap } from './ArxMap'
import { Vector3 } from './Vector3'

// ....
;(async () => {
  const { OUTPUTDIR = path.resolve('./dist'), LEVEL = '1' } = process.env

  // const level1 = await ArxMap.loadLevel(1)

  const level1 = await ArxMap.createBlankMap()

  // TODO: add polygons and other stuff

  level1.setPlayerSpawn(new Vector3(6000, 0, 6000))

  level1.finalize()
  level1.saveToDisk(OUTPUTDIR, parseInt(LEVEL))
})()
