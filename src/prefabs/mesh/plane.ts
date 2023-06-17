import { MathUtils, Mesh, MeshBasicMaterial, PlaneGeometry, Vector2 } from 'three'
import { applyTransformations } from '@src/helpers.js'
import { TextureOrMaterial } from '@src/types.js'
import { scaleUV } from '@tools/mesh/scaleUV.js'
import { toArxCoordinateSystem } from '@tools/mesh/toArxCoordinateSystem.js'

export const INDEXED = 'indexed'
export const NONINDEXED = 'non-indexed'

type createPlaneMeshProps = {
  size: Vector2
  /**
   * @default 100
   */
  tileSize?: number
  texture: TextureOrMaterial
  /**
   * @default true
   */
  tileUV?: boolean
  /**
   * @default INDEXED
   */
  isIndexed?: typeof INDEXED | typeof NONINDEXED
}

export const createPlaneMesh = ({
  size,
  tileSize = 100,
  texture,
  isIndexed = INDEXED,
  tileUV = true,
}: createPlaneMeshProps) => {
  const divisionX = Math.ceil(size.x / tileSize)
  const divisionY = Math.ceil(size.y / tileSize)

  let geometry = new PlaneGeometry(size.x, size.y, divisionX, divisionY)
  geometry = toArxCoordinateSystem(geometry)

  if (tileUV) {
    scaleUV(new Vector2(size.x / tileSize, size.y / tileSize), geometry)
  }

  const material = new MeshBasicMaterial({ map: texture })

  const mesh = new Mesh(isIndexed === INDEXED ? geometry : geometry.toNonIndexed(), material)
  mesh.rotateX(MathUtils.degToRad(90))
  applyTransformations(mesh)
  return mesh
}
