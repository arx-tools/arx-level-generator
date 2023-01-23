import { BufferAttribute, BufferGeometry, Vector2 } from 'three'

export const scaleUV = (steps: Vector2, geometry: BufferGeometry) => {
  const uv = geometry.getAttribute('uv')

  const divisionX = steps.x / 100
  const divisionY = steps.y / 100

  const newUV: number[] = []
  for (let i = 0; i < uv.count; i++) {
    newUV.push(uv.array[i * uv.itemSize] * divisionX, uv.array[i * uv.itemSize + 1] * divisionY)
  }
  geometry.setAttribute('uv', new BufferAttribute(Float32Array.from(newUV), uv.itemSize))
}
