import { BufferAttribute, MathUtils, Mesh, PlaneGeometry } from 'three'
import { Color } from '../../Color'
import { Texture } from '../../Texture'

export function createFloorMesh(width: number, height: number, color: Color, texture: Texture) {
  const divisionX = Math.ceil(width / 100)
  const divisionY = Math.ceil(height / 100)
  const floorGeometry = new PlaneGeometry(width, width, divisionX, divisionY)
  const uv = floorGeometry.getAttribute('uv')
  const newUV = []
  for (let i = 0; i < uv.count; i++) {
    newUV.push(uv.array[i * uv.itemSize] * divisionX, uv.array[i * uv.itemSize + 1] * divisionY)
  }
  floorGeometry.setAttribute('uv', new BufferAttribute(Float32Array.from(newUV), uv.itemSize))

  const floorMesh = new Mesh(floorGeometry, color.toBasicMaterial())
  floorMesh.rotateX(MathUtils.degToRad(-90))
  return floorMesh
}
