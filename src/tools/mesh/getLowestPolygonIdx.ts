import type { BufferGeometry } from 'three'
import { getNonIndexedVertices } from '@tools/mesh/getVertices.js'

export function getLowestPolygonIdx(geometry: BufferGeometry): number {
  const vertices = getNonIndexedVertices(geometry)
  const lowestArxY = Math.max(
    ...vertices.map(({ vector }) => {
      return vector.y
    }),
  )
  return vertices.findIndex(({ vector }) => {
    return vector.y === lowestArxY
  })
}
