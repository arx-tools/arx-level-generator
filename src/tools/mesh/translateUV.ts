import { BufferAttribute, type BufferGeometry, type Vector2 } from 'three'

/**
 * @param offset Vector2 with the 2 values representing X and Y axis. Both axis are expected to be
 * floats between 0 and 1
 */
export function translateUV(offset: Vector2, geometry: BufferGeometry): void {
  const uv = geometry.getAttribute('uv') as BufferAttribute

  const newUV: number[] = []
  for (let i = 0; i < uv.count; i++) {
    newUV.push(uv.array[i * uv.itemSize] + offset.x, uv.array[i * uv.itemSize + 1] + offset.y)
  }

  geometry.setAttribute('uv', new BufferAttribute(Float32Array.from(newUV), uv.itemSize))
}
