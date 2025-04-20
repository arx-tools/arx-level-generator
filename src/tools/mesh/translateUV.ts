import type { BufferAttribute, BufferGeometry, Vector2 } from 'three'

/**
 * @param offset Vector2 with the 2 values representing X and Y axis.
 * Both axis are expected to be floats between 0 and 1
 */
export function translateUV(offset: Vector2, geometry: BufferGeometry): void {
  const uv = geometry.getAttribute('uv') as BufferAttribute

  for (let idx = 0; idx < uv.count; idx++) {
    const u = uv.getX(idx) + offset.x
    const v = uv.getY(idx) + offset.y
    uv.setXY(idx, u, v)
  }
}
