import { type BufferAttribute, type Mesh } from 'three'
import { type Vector3 } from '@src/Vector3.js'
import { categorizeVertices } from '@tools/mesh/categorizeVertices.js'
import { getVertices } from '@tools/mesh/getVertices.js'

export function transformEdge(offset: Vector3, mesh: Mesh): void {
  const { edges, corners } = categorizeVertices(mesh.geometry)
  const edgeVertices = [...edges, ...corners]

  const vertices = getVertices(mesh.geometry)
  const coords = mesh.geometry.getAttribute('position') as BufferAttribute

  vertices.forEach((vertex) => {
    const edgeIdx = edgeVertices.findIndex((edgeVertex) => {
      return edgeVertex.equals(vertex.vector)
    })

    if (edgeIdx !== -1) {
      edgeVertices.splice(edgeIdx, 1)
      coords.setX(vertex.idx, vertex.vector.x + offset.x)
      coords.setY(vertex.idx, vertex.vector.y + offset.y)
      coords.setZ(vertex.idx, vertex.vector.z + offset.z)
    }
  })
}
