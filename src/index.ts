import path from 'node:path'
import { ArxMap } from './ArxMap'
import { Color } from './Color'
import { Vector3 } from './Vector3'

// ....
;(async () => {
  const { OUTPUTDIR = path.resolve('./dist'), LEVEL = '1' } = process.env

  const level1 = await ArxMap.loadLevel(1)

  // -------------------

  // slicing and glitching level1
  level1.polygons = level1.polygons.slice(30000, 50000).map((polygon) => {
    polygon.vertices[0].add(new Vector3(0, 10, 0))
    polygon.vertices[0].color = Color.fromCSS('white')
    return polygon
  })

  // -------------------

  level1.removePortals()

  level1.finalize()

  level1.saveToDisk(OUTPUTDIR, parseInt(LEVEL))
})()
