import path from 'node:path'
import { ArxMap } from './ArxMap'
import { Vector3 } from './Vector3'

// ....
;(async () => {
  const { OUTPUTDIR = path.resolve('./dist'), LEVEL = '1' } = process.env

  const level1 = await ArxMap.loadLevel(1)

  // or create a blank map
  // const level1 = await ArxMap.createBlankMap()

  // TODO: add polygons and other stuff

  // level1.setPlayerSpawn(new Vector3(0, 0, 0))

  level1.calculateNormals()
  level1.generateLights()
  level1.saveToDisk(OUTPUTDIR, parseInt(LEVEL))
})()
