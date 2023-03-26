import { Color } from '@src/Color'
import { applyTransformations } from '@src/helpers'
import { pickRandom, randomBetween } from '@src/random'
import { Rotation } from '@src/Rotation'
import { Texture } from '@src/Texture'
import { Vector3 } from '@src/Vector3'
import { scaleUV } from '@tools/mesh/scaleUV'
import { translateUV } from '@tools/mesh/translateUV'
import { MathUtils, Vector2, BoxGeometry, MeshBasicMaterial, Mesh, Group, CylinderGeometry } from 'three'

const ironPole = (position: Vector3, { x: width, y: height }: Vector2) => {
  const geometry = new CylinderGeometry(width, width, height, 4, 2, false, MathUtils.degToRad(randomBetween(0, 120)))
  scaleUV(new Vector2(0.01 * width, 1), geometry)
  translateUV(new Vector2(0.5, 0), geometry)
  geometry.translate(position.x, position.y + height / 2 - 10, position.z)

  const material = new MeshBasicMaterial({
    color: Color.white.darken(50).getHex(),
    map: Texture.l4DwarfIronBoard02,
  })

  return new Mesh(geometry, material)
}

const horizontalBar = (position: Vector3) => {
  const geometry = new BoxGeometry(220, 5, 8, 3, 1, 1)
  scaleUV(new Vector2(1, 0.01 * 8), geometry)
  translateUV(new Vector2(0.5, 0), geometry)
  geometry.translate(position.x + 110 - 20, position.y + 50, position.z)

  const material = new MeshBasicMaterial({
    color: Color.white.darken(50).getHex(),
    map: Texture.l4DwarfIronBoard02,
  })

  return new Mesh(geometry, material)
}

const fenceSegment = (hasEdgePole: boolean) => {
  const pos = new Vector3(0, 0, 0)
  const group = new Group()

  for (let i = 0; i < 10; i++) {
    const pole = ironPole(new Vector3(0, 0, 0), new Vector2(3 * randomBetween(0.75, 1.25), 200))
    if (randomBetween(0, 100) < 15) {
      pole.setRotationFromEuler(
        new Rotation(
          MathUtils.degToRad(pickRandom([-5, -4, 0, 4, 5])),
          0,
          MathUtils.degToRad(pickRandom([-5, -4, 0, 4, 5])),
        ),
      )
    } else {
      pole.setRotationFromEuler(
        new Rotation(MathUtils.degToRad(randomBetween(-3, 3)), 0, MathUtils.degToRad(randomBetween(-3, 3))),
      )
    }
    pole.translateX(pos.x)
    pole.translateY(pos.y)
    pole.translateZ(pos.z)
    group.add(pole)
    pos.add(new Vector3(20, 0, 0))
  }
  if (hasEdgePole) {
    group.add(ironPole(pos, new Vector2(8, 220)))
  }

  group.add(horizontalBar(new Vector3(0, 0, 0)))
  group.add(horizontalBar(new Vector3(0, 100, 0)))

  return group
}

export const createNorthWall = async (numberOfFences: number) => {
  const fence = new Group()
  const startPos = new Vector3(-160, 0, 50 + 800)
  const pos = startPos.clone()

  let previousAngle = new Rotation(0, 0, 0)

  for (let j = 0; j < numberOfFences; j++) {
    let angle: Rotation
    if (j < numberOfFences - 1) {
      angle = new Rotation(0, MathUtils.degToRad(randomBetween(-10, 10)), 0)
      if (pos.z < -50 || pos.z > 50) {
        angle.y *= -1
      }
      previousAngle.x += angle.x
      previousAngle.y += angle.y
      previousAngle.z += angle.z
    } else {
      angle = new Rotation(-previousAngle.x, -previousAngle.y, -previousAngle.z)
    }
    const offset = new Vector3(220, 0, 0)
    offset.applyEuler(angle)

    const segment = fenceSegment(j < numberOfFences - 1)
    segment.setRotationFromEuler(angle)
    applyTransformations(segment)
    segment.translateX(pos.x)
    segment.translateY(pos.y)
    segment.translateZ(pos.z)
    fence.add(segment)

    pos.add(offset)
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
