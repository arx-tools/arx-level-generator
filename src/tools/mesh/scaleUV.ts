import { BufferAttribute, BufferGeometry, Vector2 } from 'three'

export const scaleUV = (steps: Vector2, geometry: BufferGeometry) => {
  const uv = geometry.getAttribute('uv')

  const newUV: number[] = []
  for (let i = 0; i < uv.count; i++) {
    newUV.push(uv.array[i * uv.itemSize] * steps.x, uv.array[i * uv.itemSize + 1] * steps.y)
  }
  geometry.setAttribute('uv', new BufferAttribute(Float32Array.from(newUV), uv.itemSize))
}

export const translateUV = (offset: Vector2, geometry: BufferGeometry) => {
  const uv = geometry.getAttribute('uv')

  const newUV: number[] = []
  for (let i = 0; i < uv.count; i++) {
    newUV.push(uv.array[i * uv.itemSize] + offset.x, uv.array[i * uv.itemSize + 1] + offset.y)
  }
  geometry.setAttribute('uv', new BufferAttribute(Float32Array.from(newUV), uv.itemSize))
}
