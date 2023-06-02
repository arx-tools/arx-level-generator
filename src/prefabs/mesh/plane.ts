import { MathUtils, Mesh, MeshBasicMaterial, PlaneGeometry, Vector2 } from 'three'
import { applyTransformations } from '@src/helpers.js'
import { TextureOrMaterial } from '@src/types.js'
import { scaleUV } from '@tools/mesh/scaleUV.js'
import { toArxCoordinateSystem } from '@tools/mesh/toArxCoordinateSystem.js'

export const INDEXED = 'indexed'
export const NONINDEXED = 'non-indexed'

export const createPlaneMesh = async (
  dimensions: Vector2,
  tileSize: number,
  texture: TextureOrMaterial,
  isIndexed: typeof INDEXED | typeof NONINDEXED = INDEXED,
) => {
  const divisionX = Math.ceil(dimensions.x / tileSize)
  const divisionY = Math.ceil(dimensions.y / tileSize)

  let geometry = new PlaneGeometry(dimensions.x, dimensions.y, divisionX, divisionY)
  geometry = toArxCoordinateSystem(geometry)

  scaleUV(new Vector2(dimensions.x / tileSize, dimensions.y / tileSize), geometry)

  if (texture instanceof Promise) {
    texture = await texture
  }

  const material = new MeshBasicMaterial({
    map: texture,
  })

  const mesh = new Mesh(isIndexed === INDEXED ? geometry : geometry.toNonIndexed(), material)
  mesh.rotateX(MathUtils.degToRad(90))
  applyTransformations(mesh)
  return mesh
}
