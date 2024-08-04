import { type BufferAttribute, type BufferGeometry } from 'three'
import { Vector3 } from '@src/Vector3.js'
import { isBetween } from '@src/helpers.js'

export type GeometryVertex = {
  idx: number
  vector: Vector3
  materialIndex?: number
}

function getMaterialIndex(idx: number, geometry: BufferGeometry): number | undefined {
  if (geometry.groups.length === 0) {
    return undefined
  }

  const group = geometry.groups.find(({ start, count }) => {
    return isBetween(start, start + count - 1, idx)
  })

  return group?.materialIndex
}

/**
 * Gets the vertices of a geometry.
 * Should be used for stuff, like terrain manipulation as indexed geometries will not be unpacked
 * into individual vertices.
 */
export function getVertices(geometry: BufferGeometry): GeometryVertex[] {
  const vertices: GeometryVertex[] = []

  const coords = geometry.getAttribute('position') as BufferAttribute

  for (let idx = 0; idx < coords.count; idx++) {
    vertices.push({
      idx,
      vector: new Vector3(coords.getX(idx), coords.getY(idx), coords.getZ(idx)),
      materialIndex: getMaterialIndex(idx, geometry),
    })
  }

  return vertices
}

/**
 * Gets the non-indexed version of vertices of a geometry.
 * Should be used when converting it to Arx polygon data as Arx uses non-indexed geometry.
 */
export function getNonIndexedVertices(geometry: BufferGeometry): GeometryVertex[] {
  const vertices: GeometryVertex[] = []

  const index = geometry.getIndex()
  const coords = geometry.getAttribute('position') as BufferAttribute

  if (index === null) {
    // non-indexed geometry, all vertices are unique
    for (let idx = 0; idx < coords.count; idx++) {
      vertices.push({
        idx,
        vector: new Vector3(coords.getX(idx), coords.getY(idx), coords.getZ(idx)),
        materialIndex: getMaterialIndex(idx, geometry),
      })
    }
  } else {
    // indexed geometry, has shared vertices
    for (let i = 0; i < index.count; i++) {
      const idx = index.getX(i)
      vertices.push({
        idx,
        vector: new Vector3(coords.getX(idx), coords.getY(idx), coords.getZ(idx)),
        // TODO: if the following line produces weird things
        // then replace i with idx
        materialIndex: getMaterialIndex(i, geometry),
      })
    }
  }

  return vertices
}
