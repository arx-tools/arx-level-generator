import { MathUtils, Mesh, MeshBasicMaterial, PlaneGeometry, Vector2 } from 'three'
import { applyTransformations } from '@src/helpers.js'
import { TextureOrMaterial } from '@src/types.js'
import { scaleUV } from '@tools/mesh/scaleUV.js'
import { toArxCoordinateSystem } from '@tools/mesh/toArxCoordinateSystem.js'

export const INDEXED = 'indexed'
export const NONINDEXED = 'non-indexed'

type createPlaneMeshProps = {
  size: Vector2 | number
  /**
   * default value is 100
   */
  tileSize?: number
  texture: TextureOrMaterial
  /**
   * default value is true
   */
  tileUV?: boolean
  /**
   * default value is INDEXED
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
  const { x: width, y: depth } = typeof size === 'number' ? new Vector2(size, size) : size
  const divisionX = Math.ceil(width / tileSize)
  const divisionY = Math.ceil(depth / tileSize)

  let geometry = new PlaneGeometry(width, depth, divisionX, divisionY)
  geometry = toArxCoordinateSystem(geometry)

  if (tileUV) {
    scaleUV(new Vector2(width / tileSize, depth / tileSize), geometry)
  }

  const material = new MeshBasicMaterial({ map: texture })

  const mesh = new Mesh(isIndexed === INDEXED ? geometry : geometry.toNonIndexed(), material)
  mesh.rotateX(MathUtils.degToRad(90))
  applyTransformations(mesh)
  return mesh
}
