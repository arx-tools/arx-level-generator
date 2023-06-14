// source: https://www.scratchapixel.com/lessons/3d-basic-rendering/ray-tracing-rendering-a-triangle/barycentric-coordinates
const isPointInTriangle = (p: Vector3, a: Vector3, b: Vector3, c: Vector3) => {
  const area = triangleArea(a, b, c)

  const u = triangleArea(c, a, p) / area
  const v = triangleArea(a, b, p) / area
  const w = triangleArea(b, c, p) / area

  return isBetweenInclusive(0, 1, u) && isBetweenInclusive(0, 1, v) && isBetweenInclusive(0, 1, w) && u + v + w === 1
}

export const isPointInPolygon = (point: Vector3, polygon: FtsPolygon) => {
  const [a, b, c, d] = polygon.vertices.map(posVertexToVector)

  if (polygon.config.isQuad) {
    return isPointInTriangle(point, a, b, c) || isPointInTriangle(point, b, c, d)
  } else {
    return isPointInTriangle(point, a, b, c)
  }
}

export const flipPolygon = ([a, b, c, d]: Polygon): Polygon => {
  // vertices are laid down in a cyrillic i shape (И):
  // a c
  // b d
  // to flip both triangles I'm flipping the middle 2 vertices
  return [a, c, b, d]
}

export const sortByDistance = (fromPoint: Vector3) => (a: Vector3, b: Vector3) => {
  const distanceA = distance(fromPoint, a)
  const distanceB = distance(fromPoint, b)
  return distanceA - distanceB
}

export const circleOfVectors = (center: Vector3, radius: number, division: number) => {
  const angle = (2 * Math.PI) / division

  const vectors: Vector3[] = []

  for (let i = 0; i < division; i++) {
    const point = new ThreeJsVector3(0, 0, 1 * radius)
    const rotation = new Euler(0, angle * i, 0, 'XYZ')
    point.applyEuler(rotation)
    vectors.push(move(point.x, point.y, point.z, center))
  }

  return vectors
}

export const flipUVHorizontally = ([a, b, c, d]: UVQuad): UVQuad => {
  return [b, a, d, c]
}

export const flipUVVertically = ([a, b, c, d]: UVQuad): UVQuad => {
  return [c, d, a, b]
}

export const rotateUV = (
  degree: number,
  [rotateCenterU, rotateCenterV]: [number, number],
  [c, d, a, b]: UVQuad,
): UVQuad => {
  const normalizedDegree = normalizeDegree(degree)

  switch (normalizedDegree) {
    case 0:
      return [c, d, a, b]
    case 90:
      return [a, c, b, d]
    case 180:
      return [b, a, d, c]
    case 270:
      return [d, b, c, a]
    default:
      // TODO: implement custom rotation (https://forum.unity.com/threads/rotate-uv-coordinates-is-it-possible.135025/)
      return [a, b, c, d]
  }
}
