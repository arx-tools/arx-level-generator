import { BufferAttribute, BufferGeometry } from 'three'
import { Vector3 } from '@src/Vector3.js'
import { countBy, partition } from '@src/faux-ramda.js'
import { getNonIndexedVertices, getVertices } from '@tools/mesh/getVertices.js'

type HashAndAmount = [string, number]

const unpackCoords = (coords: HashAndAmount[]) => {
  return coords.map(([hash, amount]) => {
    const [x, y, z] = hash.split('|').map((x) => parseFloat(x))
    return new Vector3(x, y, z)
  })
}

/**
 * This function expects geometry to be triangulated, no quads or anything
 */
const categorizeVertices = (geometry: BufferGeometry) => {
  const polygons = getNonIndexedVertices(geometry)

  const summary = Object.entries(
    countBy(({ vector }) => `${vector.x}|${vector.y}|${vector.z}`, polygons),
  ) as HashAndAmount[]

  const [corner, edgeOrMiddle] = partition(([, amount]) => amount === 1 || amount === 2 || amount === 5, summary)
  const [edge, middle] = partition(([, amount]) => amount === 3, edgeOrMiddle)

  /*
  // TODO: for quadified meshes
  const [corner, edgeOrMiddle] = partition(([hash, amount]) => amount === 1 || amount === 3, summary)
  const [edge, middle] = partition(([hash, amount]) => amount === 2, edgeOrMiddle)
  */

  return {
    corners: unpackCoords(corner),
    edges: unpackCoords(edge),
    middles: unpackCoords(middle),
  }
}

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
