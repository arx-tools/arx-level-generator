import { BufferAttribute, BufferGeometry, Vector2 } from 'three'

export const translateUV = (offset: Vector2, geometry: BufferGeometry) => {
  const uv = geometry.getAttribute('uv') as BufferAttribute

  const newUV: number[] = []
  for (let i = 0; i < uv.count; i++) {
    newUV.push(uv.array[i * uv.itemSize] + offset.x, uv.array[i * uv.itemSize + 1] + offset.y)
  }
  geometry.setAttribute('uv', new BufferAttribute(Float32Array.from(newUV), uv.itemSize))
}
