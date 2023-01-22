import { Vector3 } from '@src/Vector3'
import { EdgesGeometry, Mesh } from 'three'
import { getVertices } from '@tools/mesh/getVertices'

export const transformEdge = (offset: Vector3, mesh: Mesh) => {
  const edge = new EdgesGeometry(mesh.geometry)
  const edgeVertices = getVertices(edge)

  const vertices = getVertices(mesh.geometry)
  const coords = mesh.geometry.getAttribute('position')

  vertices.forEach((vertex) => {
    const v = edgeVertices.find((edgeVertex) => {
      return edgeVertex.vector.equals(vertex.vector)
    })
    if (v !== undefined) {
      coords.setX(vertex.idx, vertex.vector.x + offset.x)
      coords.setY(vertex.idx, vertex.vector.y + offset.y)
      coords.setZ(vertex.idx, vertex.vector.z + offset.z)
    }
  })
}
