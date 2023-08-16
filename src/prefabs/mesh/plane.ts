import { MathUtils, Mesh, MeshBasicMaterial, PlaneGeometry, Vector2 } from 'three'
import { applyTransformations } from '@src/helpers.js'
import { TextureOrMaterial } from '@src/types.js'
import { scaleUV } from '@tools/mesh/scaleUV.js'
import { toArxCoordinateSystem } from '@tools/mesh/toArxCoordinateSystem.js'

export const INDEXED = 'indexed'
export const NONINDEXED = 'non-indexed'

type createPlaneMeshProps = {
  /**
   * width and height of the plane
   */
  size: Vector2 | number
  /**
   * the plane will be made from smaller squares with the size given via this prop
   * setting tileSize to 50 will subdivide the mesh into 50x50 squares
   *
   * default value is 100
   */
  tileSize?: number
  texture: TextureOrMaterial
  /**
   * If set to true, then the texture will be placed on every tile, otherwise the
   * texture will be stretched throughout the whole mesh
   *
   * default value is true
   */
  tileUV?: boolean
  /**
   * when a mesh is indexed, then polygons reuse the vertices: moving one vertex
   * will modify multiple polygons. If non-indexed, then all polygons have their
   * own vertices.
   *
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
