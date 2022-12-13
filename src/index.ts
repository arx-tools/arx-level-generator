import { getCellCoords } from 'arx-level-json-converter/dist/common/helpers'
import { ArxVertex } from 'arx-level-json-converter/dist/fts/Vertex'
import path from 'node:path'
import { ArxMap } from './ArxMap'

// ....
import { Color } from './Color'
import { Vector3 } from './Vector3'
;(async () => {
  const { OUTPUTDIR = path.resolve('./dist'), LEVEL = '1' } = process.env

  const level1 = await ArxMap.loadLevel(1)

  // -------------------

  // slicing and glitching level1
  level1.polygons = level1.polygons.slice(20000, 40000).map((polygon) => {
    polygon.vertices[0].add(new Vector3(0, 10, 0))
    polygon.vertices[0].color = Color.fromCSS('white')
    return polygon
  })

  // -------------------

  level1.fts.portals = []

  level1.fts.rooms = [
    { portals: [], polygons: [] },
    { portals: [], polygons: [] },
  ]

  const polygonPerCellCounter: Record<string, number> = {}

  level1.polygons.forEach((polygon, idx) => {
    if (polygon.polygonData.room < 1) {
      return
    }

    polygon.polygonData.room = 1

    const vertices = polygon.vertices.map((vertex) => vertex.toArxVertex())
    const [cellX, cellZ] = getCellCoords(vertices as [ArxVertex, ArxVertex, ArxVertex, ArxVertex])

    const key = `${cellX}|${cellZ}`
    if (key in polygonPerCellCounter) {
      polygonPerCellCounter[key] += 1
    } else {
      polygonPerCellCounter[key] = 0
    }

    const polygons = level1.fts.rooms[polygon.polygonData.room].polygons

    polygons.push({ px: cellX, py: cellZ, idx: polygonPerCellCounter[key] })
  })

  // level1.fts.roomDistances = [
  //   {
  //     distance: -1,
  //     startPosition: { x: 0, y: 0, z: 0 },
  //     endPosition: { x: 1, y: 0, z: 0 },
  //   },
  //   {
  //     distance: -1,
  //     startPosition: { x: 0, y: 0, z: 0 },
  //     endPosition: { x: 0, y: 1, z: 0 },
  //   },
  //   {
  //     distance: -1,
  //     startPosition: { x: 0.984375, y: 0.984375, z: 0 },
  //     endPosition: { x: 0, y: 0, z: 0 },
  //   },
  //   {
  //     distance: -1,
  //     startPosition: { x: 0, y: 0, z: 0 },
  //     endPosition: { x: 0, y: 0, z: 0 },
  //   },
  // ]

  level1.finalize()

  level1.saveToDisk(OUTPUTDIR, parseInt(LEVEL))
})()
