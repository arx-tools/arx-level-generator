import { BufferAttribute, BufferGeometry, Vector2 } from 'three'

/**
 * multiplies uv coordinates in a way that allows textures to be tiled or flipped
 *
 * `scaleUV(new Vector2(2, 3), geometry)` will shrink the texture in a way
 * that the texture will fit 2 times horizontally and 3 times vertically
 *
 * `scaleUV(new Vector(-1, 1), geometry)` will flip the texture horizontally
 * `scaleUV(new Vector(1, -1), geometry)` will flip the texture vertically
 *
 * only works with tileable textures
 */
export const scaleUV = (scale: Vector2, geometry: BufferGeometry) => {
  const uv = geometry.getAttribute('uv') as BufferAttribute

  const newUV: number[] = []
  for (let i = 0; i < uv.count; i++) {
    newUV.push(uv.array[i * uv.itemSize] * scale.x, uv.array[i * uv.itemSize + 1] * scale.y)
  }

  geometry.setAttribute('uv', new BufferAttribute(Float32Array.from(newUV), uv.itemSize))
}
