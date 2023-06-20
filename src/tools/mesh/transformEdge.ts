import { BufferAttribute, EdgesGeometry, Mesh } from 'three'
import { Vector3 } from '@src/Vector3.js'
import { getVertices } from '@tools/mesh/getVertices.js'

export const transformEdge = (offset: Vector3, mesh: Mesh) => {
  // TODO: instead of EdgesGeometry try using the edge detection code from the Alia's nightmare level
  // EdgesGeometry fails if the geometry is already bumped
  const edge = new EdgesGeometry(mesh.geometry)
  const edgeVertices = getVertices(edge)

  const vertices = getVertices(mesh.geometry)
  const coords = mesh.geometry.getAttribute('position') as BufferAttribute

  vertices.forEach((vertex) => {
    const edgeIdx = edgeVertices.findIndex((edgeVertex) => {
      return edgeVertex.vector.equals(vertex.vector)
    })
    if (edgeIdx !== -1) {
      edgeVertices.splice(edgeIdx, 1)
      coords.setX(vertex.idx, vertex.vector.x + offset.x)
      coords.setY(vertex.idx, vertex.vector.y + offset.y)
      coords.setZ(vertex.idx, vertex.vector.z + offset.z)
    }
  })
}
