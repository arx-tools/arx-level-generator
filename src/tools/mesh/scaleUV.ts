import { type BufferAttribute, type BufferGeometry, Vector2 } from 'three'
// eslint-disable-next-line unused-imports/no-unused-imports -- because it is used in jsdoc block
import { EntityModel } from '@src/EntityModel.js'

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
 *
 * It is recommended to call {@link normalizeUV} after flipping a texture to move
 * the coordinates back to the positive realm and remove the need for tiling,
 * especially for {@link EntityModel} instances
 */
export function scaleUV(scale: Vector2, geometry: BufferGeometry): void {
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

/**
 * Makes sure the uv coordinates are between 0.0 and 1.0 eliminating the need to tile textures.
 *
 * In Arx texture tiling only works if we use a square texture and also if it's the mesh/terrain (FTS)
 * that the texture gets applied to.
 *
 * Currently tiling for entities (FTL) doesn't work, so normalizing uv for {@link EntityModel} instances are a must,
 * especially after flipping a texture on one of its axis.
 *
 * @see https://github.com/arx/ArxLibertatis/pull/294
 */
export function normalizeUV(geometry: BufferGeometry): void {
  let correctedU = false
  let correctedV = false

  const uv = geometry.getAttribute('uv') as BufferAttribute

  for (let idx = 0; idx < uv.count; idx++) {
    let u = uv.getX(idx)
    let v = uv.getY(idx)

    if (u < 0) {
      if (u % 1 === 0) {
        u = 0
        correctedU = true
      } else {
        u = 1 + (u % 1)
      }
    } else if (u > 1) {
      u = u % 1
    } else if (correctedU) {
      u = 1
    }

    if (v < 0) {
      if (v % 1 === 0) {
        v = 0
        correctedV = true
      } else {
        v = 1 + (v % 1)
      }
    } else if (v > 1) {
      v = v % 1
    } else if (correctedV) {
      v = 1
    }

    uv.setXY(idx, u, v)
  }
}

/**
 * Flips a texture horizontally
 *
 * It is recommended to call {@link normalizeUV} after flipping a texture to move
 * the coordinates back to the positive realm and remove the need for tiling,
 * especially for {@link EntityModel} instances
 */
export function flipUVHorizontally(geometry: BufferGeometry): void {
  scaleUV(new Vector2(-1, 1), geometry)
}

/**
 * Flips a texture upside down
 *
 * It is recommended to call {@link normalizeUV} after flipping a texture to move
 * the coordinates back to the positive realm and remove the need for tiling,
 * especially for {@link EntityModel} instances
 */
export function flipUVVertically(geometry: BufferGeometry): void {
  scaleUV(new Vector2(1, -1), geometry)
}
