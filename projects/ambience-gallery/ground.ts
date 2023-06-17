import { Vector2 } from 'three'
import { Texture } from '@src/Texture.js'
import { Vector3 } from '@src/Vector3.js'
import { createPlaneMesh } from '@prefabs/mesh/plane.js'
import { makeBumpy } from '@tools/mesh/makeBumpy.js'
import { scaleUV } from '@tools/mesh/scaleUV.js'
import { transformEdge } from '@tools/mesh/transformEdge.js'

export const createGround = (width: number, depth: number) => {
  const floorMesh = createPlaneMesh({
    size: new Vector2(width + 200, depth + 200),
    tileSize: 30,
    texture: Texture.l5CavesGravelGround05,
  })
  floorMesh.translateX(width / 2 - 200)

  transformEdge(new Vector3(0, -5, 0), floorMesh)
  makeBumpy(12, 50, true, floorMesh.geometry)

  scaleUV(new Vector2(0.25, 0.25), floorMesh.geometry)

  return floorMesh
}
