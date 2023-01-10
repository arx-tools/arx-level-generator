import { BufferAttribute, MathUtils, Mesh, MeshBasicMaterial, PlaneGeometry } from 'three'
import { Color } from '@src/Color'
import { applyTransformations } from '@src/helpers'
import { Texture } from '@src/Texture'

export const INDEXED = true
export const NONINDEXED = false

export async function createPlaneMesh(
  width: number,
  height: number,
  color: Color,
  texture: Texture | Promise<Texture>,
  isIndexed = INDEXED,
) {
  const divisionX = Math.ceil(width / 100)
  const divisionY = Math.ceil(height / 100)

  const geometry = new PlaneGeometry(width, width, divisionX, divisionY)

  const uv = geometry.getAttribute('uv')
  const newUV = []
  for (let i = 0; i < uv.count; i++) {
    newUV.push(uv.array[i * uv.itemSize] * divisionX, uv.array[i * uv.itemSize + 1] * divisionY)
  }
  geometry.setAttribute('uv', new BufferAttribute(Float32Array.from(newUV), uv.itemSize))

  if (texture instanceof Promise) {
    texture = await texture
  }

  const material = new MeshBasicMaterial({
    color: color.getHex(),
    map: texture,
  })

  const mesh = new Mesh(isIndexed === INDEXED ? geometry : geometry.toNonIndexed(), material)
  mesh.rotateX(MathUtils.degToRad(-90))
  applyTransformations(mesh)
  return mesh
}
