import { BufferAttribute, BufferGeometry, MathUtils } from 'three'
import { Vector3 } from '@src/Vector3.js'
import { sum } from '@src/faux-ramda.js'
import { randomBetween, randomIntBetween } from '@src/random.js'
import { getVertices } from '@tools/mesh/getVertices.js'

type VertexData = { y: number; position: Vector3; idx: number }

/**
 * @param magnitude - the maximum amount in both directions which the peeks will reach, or if an array with 2
 * numbers specified then that will be used as minimum maximum range
 * @param percentage - for every vertex there's a certain percentage chance that it will be a peek. control the
 * percentage with this parameter
 * @param smoothenPeeks - whether to apply smoothing around the peeks
 * @param geometry - any threejs geometry
 * @returns the vectors of the peeks
 */
export const makeBumpy = (
  magnitude: number | [number, number],
  percentage: number,
  smoothenPeeks: boolean,
  geometry: BufferGeometry,
) => {
  const vertices = getVertices(geometry)
  const coords = geometry.getAttribute('position') as BufferAttribute

  const peeks: (VertexData & { affectedVertices: { elevation: number; distance: number }[] })[] = []
  const notPeeks: VertexData[] = []

  // split vertices into peeks and not-peeks while also calculating the peek heights.
  // this does not yet apply the height change for the peeks
  vertices.forEach((v) => {
    const isToBePeeked = randomIntBetween(0, 100) < percentage

    let newY = v.vector.y
    if (isToBePeeked) {
      if (typeof magnitude === 'number') {
        newY += randomBetween(-magnitude, magnitude)
      } else {
        newY += randomBetween(magnitude[0], magnitude[1])
      }
    }

    const data = {
      y: newY,
      position: v.vector,
      idx: v.idx,
      affectedVertices: [],
    }

    if (isToBePeeked) {
      peeks.push(data)
    } else {
      notPeeks.push(data)
    }
  })

  if (smoothenPeeks) {
    // smooth peeks by raising not-peeks around them - the dropoff angle is 45 degrees.
    // the implementation does this by measuring the height of all near peeks and sums the distance based elevations.
    // it also saves which peeks affect which not-peeks
    notPeeks.forEach(({ y, position, idx }) => {
      const diffs: number[] = []
      peeks.forEach((p) => {
        const distance = p.position.distanceTo(position)
        const elevation = p.y - y
        const volume = MathUtils.clamp(1 - distance / Math.abs(elevation), 0, 1)
        if (volume > 0) {
          p.affectedVertices.push({ elevation, distance })
          diffs.push(elevation * volume)
        }
      })

      let addition
      if (typeof magnitude === 'number') {
        addition = MathUtils.clamp(sum(diffs), -magnitude, magnitude)
      } else {
        addition = MathUtils.clamp(sum(diffs), magnitude[0], magnitude[1])
      }

      coords.setY(idx, y + addition)
    })
  }

  // applies peek height.
  // if the peek affected any near vertices' height, then lower it's own height
  // to match the height of the highest affected not-peek
  peeks.forEach(({ y, affectedVertices, idx }, i) => {
    let peekY = y
    if (affectedVertices.length > 0) {
      const closestVertexY = affectedVertices.sort((a, b) => {
        if (a.distance !== b.distance) {
          // sort by distance, ascending order
          return a.distance - b.distance
        }

        // distance is the same, sort by elevation, descending magnitude
        return Math.abs(b.elevation) - Math.abs(a.elevation)
      })

      // TODO: this doesn't seem to work as intended, the terrain is still spikey
      peekY = closestVertexY[0].elevation

      peeks[i].y = peekY
    }
    coords.setY(idx, peekY)
  })

  return peeks.map(({ position }) => position)
}
