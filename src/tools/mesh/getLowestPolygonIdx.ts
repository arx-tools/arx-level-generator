import { BufferGeometry } from 'three'
import { getNonIndexedVertices } from '@tools/mesh/getVertices.js'

export const getLowestPolygonIdx = (geometry: BufferGeometry) => {
  const vertices = getNonIndexedVertices(geometry)
  const lowestArxY = Math.max(...vertices.map(({ vector }) => vector.y))
  return vertices.findIndex(({ vector }) => vector.y === lowestArxY)
}
