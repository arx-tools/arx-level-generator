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
