import { BufferAttribute, BufferGeometry } from 'three'
import { getVertices } from '@tools/mesh/getVertices.js'
import { categorizeVertices } from './categorizeVertices.js'

/**
 * Connect the edge vertices of "source" to the edge vertices of "target"
 */
export const connectEdgeTo = (source: BufferGeometry, target: BufferGeometry) => {
  const categorizedSourceVertices = categorizeVertices(source)
  const sourceEdgeVertices = [...categorizedSourceVertices.edges, ...categorizedSourceVertices.corners]

  const sourceVertices = getVertices(source)
  const sourceCoords = source.getAttribute('position') as BufferAttribute

  const categorizedTargetVertices = categorizeVertices(target)
  const targetEdgeVertices = [...categorizedTargetVertices.edges, ...categorizedTargetVertices.corners]

  sourceVertices.forEach((vertex) => {
    const edgeIdx = sourceEdgeVertices.findIndex((edgeVertex) => {
      return edgeVertex.equals(vertex.vector)
    })
    if (edgeIdx !== -1) {
      const [edgePoint] = sourceEdgeVertices.splice(edgeIdx, 1)

      const closestTargetVertex = targetEdgeVertices.slice(1).reduce((closestSoFar, candidate) => {
        if (candidate.distanceTo(edgePoint) < closestSoFar.distanceTo(edgePoint)) {
          return candidate
        } else {
          return closestSoFar
        }
      }, targetEdgeVertices[0])

      sourceCoords.setX(vertex.idx, closestTargetVertex.x)
      sourceCoords.setY(vertex.idx, closestTargetVertex.y)
      sourceCoords.setZ(vertex.idx, closestTargetVertex.z)
    }
  })
}
