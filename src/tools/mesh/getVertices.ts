import { BufferAttribute, BufferGeometry } from 'three'
import { Vector3 } from '@src/Vector3.js'

/**
 * Gets the vertices of a geometry.
 * Should be used for stuff, like terrain manipulation as indexed geometries will not be unpacked
 * into individual vertices.
 */
export const getVertices = (geometry: BufferGeometry) => {
  const vertices: { vector: Vector3; idx: number }[] = []

  const coords = geometry.getAttribute('position') as BufferAttribute

  for (let idx = 0; idx < coords.count; idx++) {
    vertices.push({
      idx,
      vector: new Vector3(coords.getX(idx), coords.getY(idx), coords.getZ(idx)),
    })
  }

  return vertices
}

/**
 * Gets the non-indexed version of vertices of a geometry.
 * Should be used when converting it to Arx polygon data as Arx uses non-indexed geometry.
 */
export const getNonIndexedVertices = (geometry: BufferGeometry) => {
  const vertices: { vector: Vector3; idx: number }[] = []

  const index = geometry.getIndex()
  const coords = geometry.getAttribute('position') as BufferAttribute

  if (index === null) {
    // non-indexed geometry, all vertices are unique
    for (let idx = 0; idx < coords.count; idx++) {
      vertices.push({
        idx,
        vector: new Vector3(coords.getX(idx), coords.getY(idx), coords.getZ(idx)),
      })
    }
  } else {
    // indexed geometry, has shared vertices
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
