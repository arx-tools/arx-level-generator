import { type BufferGeometry } from 'three'
import { Vector3 } from '@src/Vector3.js'
import { countBy, partition } from '@src/faux-ramda.js'
import { getNonIndexedVertices } from '@tools/mesh/getVertices.js'

type HashAndAmount = [string, number]

function unpackCoords(coords: HashAndAmount[]): Vector3[] {
  return coords.map(([hash]) => {
    const [x, y, z] = hash.split('|').map((x) => {
      return Number.parseFloat(x)
    })

    return new Vector3(x, y, z)
  })
}

/**
 * This function expects geometry to be triangulated, no quads or anything
 */
export function categorizeVertices(geometry: BufferGeometry): {
  corners: Vector3[]
  edges: Vector3[]
  middles: Vector3[]
} {
  const polygons = getNonIndexedVertices(geometry)

  const summary = Object.entries(
    countBy(({ vector }) => {
      return `${vector.x}|${vector.y}|${vector.z}`
    }, polygons),
  ) as HashAndAmount[]

  const [corner, edgeOrMiddle] = partition(([, amount]) => {
    return amount === 1 || amount === 2 || amount === 5
  }, summary)

  const [edge, middle] = partition(([, amount]) => {
    return amount === 3
  }, edgeOrMiddle)

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
