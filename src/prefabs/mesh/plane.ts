import { BufferAttribute, MathUtils, Mesh, MeshBasicMaterial, PlaneGeometry, Vector2 } from 'three'
import { Color } from '@src/Color'
import { applyTransformations } from '@src/helpers'
import { Texture } from '@src/Texture'
import { scaleUV } from '@tools/mesh/scaleUV'

export const INDEXED = 'indexed'
export const NONINDEXED = 'non-indexed'

export async function createPlaneMesh(
  width: number,
  height: number,
  color: Color,
  texture: Texture | Promise<Texture>,
  isIndexed: typeof INDEXED | typeof NONINDEXED = INDEXED,
) {
  const divisionX = Math.ceil(width / 100)
  const divisionY = Math.ceil(height / 100)

  const geometry = new PlaneGeometry(width, height, divisionX, divisionY)

  scaleUV(new Vector2(width, height), geometry)

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
