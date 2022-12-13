import path from 'node:path'
import { ArxMap } from './ArxMap'

// ....
;(async () => {
  const { OUTPUTDIR = path.resolve('./dist'), LEVEL = '1' } = process.env

  const level1 = await ArxMap.loadLevel(1)

  // -------------------

  level1.removePortals()

  level1.finalize()

  level1.saveToDisk(OUTPUTDIR, parseInt(LEVEL))
})()
