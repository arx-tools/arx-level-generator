import { Vector3 } from '@src/Vector3'
import { BufferGeometry } from 'three'

export const getVertices = (geometry: BufferGeometry) => {
  const index = geometry.getIndex()
  const coords = geometry.getAttribute('position')

  const vertices: { vector: Vector3; idx: number }[] = []

  if (index === null) {
    // non-indexed, all vertices are unique
    for (let idx = 0; idx < coords.count; idx++) {
      vertices.push({
        idx,
        vector: new Vector3(coords.getX(idx), coords.getY(idx), coords.getZ(idx)),
      })
    }
  } else {
    // indexed, has shared vertices
    for (let i = 0; i < index.count; i++) {
      const idx = index.getX(i)
      vertices.push({
        idx,
        vector: new Vector3(coords.getX(idx), coords.getY(idx), coords.getZ(idx)),
      })
    }
  }

  return vertices
}
