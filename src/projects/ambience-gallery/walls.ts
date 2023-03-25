import { createPlaneMesh } from '@prefabs/mesh/plane'
import { Color } from '@src/Color'
import { applyTransformations } from '@src/helpers'
import { Material } from '@src/Material'
import { randomBetween } from '@src/random'
import { Rotation } from '@src/Rotation'
import { Texture } from '@src/Texture'
import { Vector3 } from '@src/Vector3'
import { scaleUV } from '@tools/mesh/scaleUV'
import { translateUV } from '@tools/mesh/translateUV'
import { ArxPolygonFlags } from 'arx-convert/types'
import { MathUtils, Vector2, BoxGeometry, MeshBasicMaterial, Mesh, Group } from 'three'

const ironPole = (position: Vector3, { x: width, y: height }: Vector2) => {
  const geometry = new BoxGeometry(width, height, width, 1, 2, 1)
  scaleUV(new Vector2(0.01 * width, 1), geometry)
  translateUV(new Vector2(0.5, 0), geometry)
  geometry.translate(position.x, position.y + height / 2 - 10, position.z)

  const material = new MeshBasicMaterial({
    color: Color.white.darken(50).getHex(),
    map: Texture.l4DwarfIronBoard02,
  })

  return new Mesh(geometry, material)
}

const fenceSegment = (pos: Vector3, hasEdgePole: boolean) => {
  const group = new Group()

  if (hasEdgePole) {
    group.add(ironPole(pos.clone(), new Vector2(5, 220)))
  }
  for (let i = 0; i < 10; i++) {
    group.add(ironPole(new Vector3(pos.x + 20 + i * 20, pos.y, pos.z), new Vector2(3, 200)))
  }

  return group
}

export const createNorthWall = async (numberOfFences: number) => {
  const fence = new Group()
  const pos = new Vector3(-180, 0, 50)

  const dentOffsetTotal = new Vector3(0, 0, 800)

  for (let j = 0; j < numberOfFences; j++) {
    const dentAngle = new Rotation(0, MathUtils.degToRad(randomBetween(-10, 10)), 0)
    const dentOffset = new Vector3(220, 0, 0)
    dentOffset.applyEuler(dentAngle)
    console.log(dentOffset)

    const segment = fenceSegment(pos, j > 0)
    segment.setRotationFromEuler(dentAngle) // rotation origin is center
    applyTransformations(segment)
    segment.translateX(dentOffsetTotal.x)
    segment.translateY(dentOffsetTotal.y)
    segment.translateZ(dentOffsetTotal.z)
    fence.add(segment)

    dentOffsetTotal.add(dentOffset)
  }

  return [fence]

  // const wallSize = new Vector2(width, 200)
  // const wallMesh = await createPlaneMesh(
  //   wallSize,
  //   100,
  //   Color.white.darken(50),
  //   Material.fromTexture(Texture.l1DragonSpideLime1Nocol, { flags: ArxPolygonFlags.NoShadow }),
  // )
  // wallMesh.translateX(wallSize.x / 2 - 200)
  // wallMesh.translateY(wallSize.y / 2 - 15)
  // wallMesh.translateZ(800 + 50 + 8)
  // wallMesh.rotateX(MathUtils.degToRad(90 + 5))
  // wallMesh.rotateZ(MathUtils.degToRad(180))
  // scaleUV(new Vector2(100 / wallSize.y, 100 / wallSize.y), wallMesh.geometry)
  // translateUV(new Vector2(0, -1 / (wallMesh.material.map as Texture).height), wallMesh.geometry)
  // const blockerSize = new Vector2(width, 300)
  // const blockerMesh = await createPlaneMesh(
  //   blockerSize,
  //   100,
  //   Color.white.darken(50),
  //   Material.fromTexture(Texture.alpha, { flags: ArxPolygonFlags.NoShadow }),
  // )
  // blockerMesh.translateX(blockerSize.x / 2 - 200)
  // blockerMesh.translateY(blockerSize.y / 2 - 15)
  // blockerMesh.translateZ(800 + 50)
  // blockerMesh.rotateX(MathUtils.degToRad(90))
  // blockerMesh.rotateZ(MathUtils.degToRad(180))
  // return [wallMesh, blockerMesh]
}

export const createSouthWall = async (width: number) => {
  // const [wallMesh, blockerMesh] = await createNorthWall(width)
  // applyTransformations(wallMesh)
  // wallMesh.translateX(2700)
  // wallMesh.rotateY(MathUtils.degToRad(180))
  // applyTransformations(blockerMesh)
  // blockerMesh.translateX(2700)
  // blockerMesh.rotateY(MathUtils.degToRad(180))
  // return [wallMesh, blockerMesh]
}

export const createEastWall = async (width: number) => {
  // const [wallMesh, blockerMesh] = await createNorthWall(width)
  // applyTransformations(wallMesh)
  // wallMesh.translateX(650)
  // wallMesh.translateZ(-width / 2 + 200)
  // wallMesh.rotateY(MathUtils.degToRad(-90))
  // applyTransformations(blockerMesh)
  // blockerMesh.translateX(650)
  // blockerMesh.translateZ(-width / 2 + 200)
  // blockerMesh.rotateY(MathUtils.degToRad(-90))
  // return [wallMesh, blockerMesh]
}

export const createWestWall = async (width: number) => {
  // const [wallMesh, blockerMesh] = await createNorthWall(width)
  // applyTransformations(wallMesh)
  // wallMesh.translateZ(650)
  // wallMesh.translateX(width + 350)
  // wallMesh.rotateY(MathUtils.degToRad(90))
  // applyTransformations(blockerMesh)
  // blockerMesh.translateZ(650)
  // blockerMesh.translateX(width + 350)
  // blockerMesh.rotateY(MathUtils.degToRad(90))
  // return [wallMesh, blockerMesh]
}
