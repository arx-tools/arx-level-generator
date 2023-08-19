import { BufferGeometry } from 'three'
import { Vector3 } from '@src/Vector3.js'
import { countBy, partition } from '@src/faux-ramda.js'
import { getNonIndexedVertices } from '@tools/mesh/getVertices.js'

type HashAndAmount = [string, number]

const unpackCoords = (coords: HashAndAmount[]) => {
  return coords.map(([hash]) => {
    const [x, y, z] = hash.split('|').map((x) => parseFloat(x))
    return new Vector3(x, y, z)
  })
}

/**
 * This function expects geometry to be triangulated, no quads or anything
 */
export const categorizeVertices = (geometry: BufferGeometry) => {
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
