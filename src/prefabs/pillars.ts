import { isBetweenInclusive, randomBetween, move, MapData } from '../helpers'
import { Vector3 } from '../types'
import pillar from './pillar'

const isInExcludeRadius = (pos: Vector3, excludeRadius: number | [number, number], x: number, z: number) => {
  const [originalX, originalY, originalZ] = pos
  const [excludeRadiusX, excludeRadiusZ] = Array.isArray(excludeRadius) ? excludeRadius : [excludeRadius, excludeRadius]

  if (excludeRadiusX === 0 && excludeRadiusZ === 0) {
    return false
  }

  return (
    isBetweenInclusive(originalX - excludeRadiusX / 2, originalX + excludeRadiusX / 2, x) &&
    isBetweenInclusive(originalZ - excludeRadiusZ / 2, originalZ + excludeRadiusZ / 2, z)
  )
}

const isInBorderGap = (pos: Vector3, borderGap: [number, number, number, number], x: number, z: number) => {
  const [originalX, originalY, originalZ] = pos
  const [top, right, bottom, left] = borderGap // clockwise order, like in CSS

  if (top > 0 && z > 0 && isBetweenInclusive(originalX - top / 2, originalX + top / 2, x)) {
    return true
  }

  if (bottom > 0 && z < 0 && isBetweenInclusive(originalX - bottom / 2, originalX + bottom / 2, x)) {
    return true
  }

  if (left > 0 && x < 0 && isBetweenInclusive(originalZ - left / 2, originalZ + left / 2, z)) {
    return true
  }

  if (right > 0 && x > 0 && isBetweenInclusive(originalZ - right / 2, originalZ + right / 2, z)) {
    return true
  }

  return false
}

const tooCloseToOtherPillars = (x: number, z: number) => {
  // TODO: generate them more evenly spaced out
  return false
}

const pillars = (
  pos: Vector3,
  n: number,
  radius: number | [number, number],
  excludeRadius = 100,
  borderGap: [number, number, number, number] = [0, 0, 0, 0],
  mapData: MapData,
) => {
  for (let i = 0; i < n; i++) {
    const [originalX, originalY, originalZ] = pos
    const [radiusX, radiusZ] = Array.isArray(radius) ? radius : [radius, radius]

    let x
    let z

    do {
      x = originalX + randomBetween(-radiusX / 2, radiusX / 2)
      z = originalZ + randomBetween(-radiusZ / 2, radiusZ / 2)
    } while (
      isInExcludeRadius(pos, excludeRadius, x, z) ||
      isInBorderGap(pos, borderGap, x, z) ||
      tooCloseToOtherPillars(x, z)
    )

    pillar(move(x, originalY, z, mapData.config.origin.coords), 20, mapData)
  }
}

export default pillars
