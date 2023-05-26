import { createPlaneMesh } from '@prefabs/mesh/plane.js'
import { Color } from '@src/Color.js'
import { Material } from '@src/Material.js'
import { Texture } from '@src/Texture.js'
import { Vector3 } from '@src/Vector3.js'
import { TextureOrMaterial } from '@src/types.js'
import { makeBumpy } from '@tools/mesh/makeBumpy.js'
import { scaleUV } from '@tools/mesh/scaleUV.js'
import { transformEdge } from '@tools/mesh/transformEdge.js'
import { ArxPolygonFlags } from 'arx-convert/types'
import { Vector2 } from 'three'

export const createGround = async ({
  size,
  texture = Texture.l5CavesGravelGround05,
}: {
  size: Vector2
  texture?: TextureOrMaterial
}) => {
  const tileSize = 100

  const floorMesh = await createPlaneMesh(size, tileSize, Color.white.darken(50), texture)
  transformEdge(new Vector3(0, -30, 0), floorMesh)
  makeBumpy(30, 60, false, floorMesh.geometry)
  scaleUV(new Vector2(tileSize / 100, tileSize / 100), floorMesh.geometry)

  const waterMesh = await createPlaneMesh(
    size,
    tileSize,
    Color.white,
    Material.fromTexture(Texture.waterCavewater, {
      flags: ArxPolygonFlags.Water | ArxPolygonFlags.Transparent | ArxPolygonFlags.NoShadow,
    }),
  )
  scaleUV(new Vector2(tileSize / 100, tileSize / 100), waterMesh.geometry)

  return [floorMesh, waterMesh]
}