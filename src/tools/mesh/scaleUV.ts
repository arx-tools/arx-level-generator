import { BufferAttribute, BufferGeometry, Vector2 } from 'three'

/**
 * only works with tileable textures
 *
 * multiplies uv coordinates in a way that allows textures to be tiled or flipped
 *
 * `scaleUV(new Vector2(2, 3), geometry)` will shrink the texture in a way
 * that the texture will fit 2 times horizontally and 3 times vertically
 *
 * `scaleUV(new Vector(-1, 1), geometry)` will flip the texture horizontally
 * `scaleUV(new Vector(1, -1), geometry)` will flip the texture vertically
 */
export const scaleUV = (scale: Vector2, geometry: BufferGeometry) => {
  if (scale.x === 1 && scale.y === 1) {
    return
  }

  const uv = geometry.getAttribute('uv') as BufferAttribute

  for (let idx = 0; idx < uv.count; idx++) {
    const u = uv.getX(idx) * scale.x
    const v = uv.getY(idx) * scale.y
    uv.setXY(idx, u, v)
  }
}

export const normalizeUV = (geometry: BufferGeometry) => {
  const uv = geometry.getAttribute('uv') as BufferAttribute

  for (let idx = 0; idx < uv.count; idx++) {
    let u = uv.getX(idx)
    let v = uv.getY(idx)

    if (u < 0) {
      u = 1 - (u % 1)
    } else if (u > 1) {
      u = u % 1
    }

    if (v < 0) {
      v = 1 - (v % 1)
    } else if (v > 1) {
      v = v % 1
    }

    uv.setXY(idx, u, v)
  }
}

export const flipUVHorizontally = (geometry: BufferGeometry) => {
  return scaleUV(new Vector2(-1, 1), geometry)
}

export const flipUVVertically = (geometry: BufferGeometry) => {
  return scaleUV(new Vector2(1, -1), geometry)
}
