import { randomBetween } from '@src/random'
import { BufferGeometry, MathUtils, Vector2 } from 'three'
import { getVertices } from '@tools/mesh/getVertices'
import { sum } from '@src/faux-ramda'

export const makeBumpy = (volume: number, percentage: number, smoothRadius: number, geometry: BufferGeometry) => {
  const vertices = getVertices(geometry)
  const coords = geometry.getAttribute('position')

  const peeks: { y: number; position: Vector2; idx: number }[] = []
  const notPeeks: { y: number; position: Vector2; idx: number }[] = []

  vertices.forEach((v, i) => {
    // const isToBePeeked = randomBetween(0, 100) < percentage
    const isToBePeeked = i === 12000 || i === 19500

    let newY: number = 0

    if (isToBePeeked) {
      // newY = v.vector.y + randomBetween(-volume, volume)
      if (i === 12000) {
        newY = v.vector.y + 200
      } else {
        newY = v.vector.y - 300
      }
      coords.setY(v.idx, newY)
    }

    if (smoothRadius <= 0) {
      return
    }

    const data = { y: newY, position: new Vector2(v.vector.x, v.vector.z), idx: v.idx }

    if (isToBePeeked) {
      peeks.push(data)
    } else {
      notPeeks.push(data)
    }
  })

  if (smoothRadius > 0) {
    notPeeks.forEach(({ y, position, idx }) => {
      const closePeeks = peeks.filter((p) => {
        const distance = p.position.distanceTo(position)
        return distance > 0 // && distance <= smoothRadius
      })

      if (closePeeks.length === 0) {
        return
      }

      const diffs = closePeeks.map((p) => {
        const distance = p.position.distanceTo(position)
        return (p.y - y) * MathUtils.clamp(1 - Math.sqrt(distance / smoothRadius), 0, 1)
      })
      const addition = sum(diffs) / diffs.length
      // const addition = sum(diffs) / diffs.length
      // const addition = Math.max(...diffs)

      coords.setY(idx, y + addition)
    })
  }
}
