import { BufferAttribute, MathUtils, Mesh, MeshBasicMaterial, PlaneGeometry, Vector2 } from 'three'
import { Color } from '@src/Color'
import { applyTransformations } from '@src/helpers'
import { Texture } from '@src/Texture'
import { scaleUV } from '@tools/mesh/scaleUV'

export const INDEXED = 'indexed'
export const NONINDEXED = 'non-indexed'

export const createPlaneMesh = async (
  dimensions: Vector2,
  tileSize: number,
  color: Color,
  texture: Texture | Promise<Texture>,
  isIndexed: typeof INDEXED | typeof NONINDEXED = INDEXED,
) => {
  const divisionX = Math.ceil(dimensions.x / tileSize)
  const divisionY = Math.ceil(dimensions.y / tileSize)

  const geometry = new PlaneGeometry(dimensions.x, dimensions.y, divisionX, divisionY)

  scaleUV(new Vector2(dimensions.x / tileSize, dimensions.y / tileSize), geometry)

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
