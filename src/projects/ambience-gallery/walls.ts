import { createPlaneMesh } from '@prefabs/mesh/plane'
import { Color } from '@src/Color'
import { applyTransformations } from '@src/helpers'
import { Material } from '@src/Material'
import { Texture } from '@src/Texture'
import { scaleUV } from '@tools/mesh/scaleUV'
import { translateUV } from '@tools/mesh/translateUV'
import { ArxPolygonFlags } from 'arx-convert/types'
import { MathUtils, Vector2 } from 'three'

export const createNorthWall = async (width: number) => {
  const wallSize = new Vector2(width, 200)
  const wallMesh = await createPlaneMesh(
    wallSize,
    100,
    Color.white.darken(50),
    Material.fromTexture(Texture.l1DragonSpideLime1Nocol, { flags: ArxPolygonFlags.NoShadow }),
  )
  wallMesh.translateX(wallSize.x / 2 - 200)
  wallMesh.translateY(wallSize.y / 2 - 15)
  wallMesh.translateZ(800 + 50 + 8)
  wallMesh.rotateX(MathUtils.degToRad(90 + 5))
  wallMesh.rotateZ(MathUtils.degToRad(180))
  scaleUV(new Vector2(100 / wallSize.y, 100 / wallSize.y), wallMesh.geometry)
  translateUV(new Vector2(0, -1 / (wallMesh.material.map as Texture).height), wallMesh.geometry)

  const blockerSize = new Vector2(width, 300)
  const blockerMesh = await createPlaneMesh(
    blockerSize,
    100,
    Color.white.darken(50),
    Material.fromTexture(Texture.alpha, { flags: ArxPolygonFlags.NoShadow }),
  )
  blockerMesh.translateX(blockerSize.x / 2 - 200)
  blockerMesh.translateY(blockerSize.y / 2 - 15)
  blockerMesh.translateZ(800 + 50)
  blockerMesh.rotateX(MathUtils.degToRad(90))
  blockerMesh.rotateZ(MathUtils.degToRad(180))

  return [wallMesh, blockerMesh]
}

export const createSouthWall = async (width: number) => {
  const [wallMesh, blockerMesh] = await createNorthWall(width)

  applyTransformations(wallMesh)
  wallMesh.translateX(2700)
  wallMesh.rotateY(MathUtils.degToRad(180))

  applyTransformations(blockerMesh)
  blockerMesh.translateX(2700)
  blockerMesh.rotateY(MathUtils.degToRad(180))

  return [wallMesh, blockerMesh]
}

export const createEastWall = async (width: number) => {
  const [wallMesh, blockerMesh] = await createNorthWall(width)

  applyTransformations(wallMesh)
  wallMesh.translateX(650)
  wallMesh.translateZ(-width / 2 + 200)
  wallMesh.rotateY(MathUtils.degToRad(-90))

  applyTransformations(blockerMesh)
  blockerMesh.translateX(650)
  blockerMesh.translateZ(-width / 2 + 200)
  blockerMesh.rotateY(MathUtils.degToRad(-90))

  return [wallMesh, blockerMesh]
}

export const createWestWall = async (width: number) => {
  const [wallMesh, blockerMesh] = await createNorthWall(width)

  applyTransformations(wallMesh)
  wallMesh.translateZ(650)
  wallMesh.translateX(width + 350)
  wallMesh.rotateY(MathUtils.degToRad(90))

  applyTransformations(blockerMesh)
  blockerMesh.translateZ(650)
  blockerMesh.translateX(width + 350)
  blockerMesh.rotateY(MathUtils.degToRad(90))

  return [wallMesh, blockerMesh]
}
