import { Color } from '@src/Color.js'
import { applyTransformations, isBetween } from '@src/helpers.js'
import { pickRandom, randomBetween } from '@src/random.js'
import { Rotation } from '@src/Rotation.js'
import { Texture } from '@src/Texture.js'
import { Vector3 } from '@src/Vector3.js'
import { scaleUV } from '@tools/mesh/scaleUV.js'
import { toArxCoordinateSystem } from '@tools/mesh/toArxCoordinateSystem.js'
import { translateUV } from '@tools/mesh/translateUV.js'
import { MathUtils, Vector2, BoxGeometry, MeshBasicMaterial, Mesh, Group, CylinderGeometry } from 'three'

const createIronPole = (position: Vector3, { x: width, y: height }: Vector2) => {
  let geometry = new CylinderGeometry(width, width, height, 4, 2, false, MathUtils.degToRad(randomBetween(0, 120)))
  geometry = toArxCoordinateSystem(geometry)

  scaleUV(new Vector2(0.01 * width, 1), geometry)
  translateUV(new Vector2(0.5, 0), geometry)
  geometry.translate(position.x, position.y - height / 2 + 10, position.z)

  const material = new MeshBasicMaterial({
    color: Color.white.darken(50).getHex(),
    map: Texture.l4DwarfIronBoard02,
  })

  return new Mesh(geometry, material)
}

const createHorizontalBar = (position: Vector3) => {
  let geometry = new BoxGeometry(220, 5, 8, 3, 1, 1)
  geometry = toArxCoordinateSystem(geometry)

  scaleUV(new Vector2(1, 0.01 * 8), geometry)
  translateUV(new Vector2(0.5, 0), geometry)
  geometry.translate(position.x + 110 - 20, position.y - 50, position.z)

  const material = new MeshBasicMaterial({
    color: Color.white.darken(50).getHex(),
    map: Texture.l4DwarfIronBoard02,
  })

  return new Mesh(geometry, material)
}

const createFenceSegment = (hasEdgePole: boolean) => {
  const pos = new Vector3(0, 0, 0)
  const group = new Group()

  for (let i = 0; i < 10; i++) {
    const pole = createIronPole(new Vector3(0, 0, 0), new Vector2(3 * randomBetween(0.75, 1.25), 200))
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
    group.add(createIronPole(pos, new Vector2(8, 220)))
  }

  group.add(createHorizontalBar(new Vector3(0, 0, 0)))
  group.add(createHorizontalBar(new Vector3(0, -100, 0)))

  return group
}

export const createEastWestWall = (startPos: Vector3, numberOfSegments: number) => {
  const fence = new Group()
  const pos = startPos.clone()

  let previousAngle = new Rotation(0, 0, 0)

  for (let j = 0; j < numberOfSegments; j++) {
    const offset = new Vector3(220, 0, 0)
    let angle: Rotation
    if (j < numberOfSegments - 1) {
      angle = new Rotation(0, MathUtils.degToRad(randomBetween(-10, 10)), 0)
      const futurePos = pos.clone().add(offset.clone().applyEuler(angle)).sub(startPos)
      if (!isBetween(-50, 50, futurePos.z)) {
        angle.y *= -1
      }
      previousAngle.x += angle.x
      previousAngle.y += angle.y
      previousAngle.z += angle.z
    } else {
      angle = new Rotation(-previousAngle.x, -previousAngle.y, -previousAngle.z)
    }
    offset.applyEuler(angle)

    const segment = createFenceSegment(j < numberOfSegments - 1)
    segment.setRotationFromEuler(angle)
    applyTransformations(segment)
    segment.translateX(pos.x)
    segment.translateY(pos.y)
    segment.translateZ(pos.z)
    fence.add(segment)

    pos.add(offset)
  }

  return fence
}

export const createNorthSouthWall = (startPos: Vector3, numberOfSegments: number) => {
  const fence = createEastWestWall(new Vector3(0, 0, 0), numberOfSegments)
  fence.rotateY(MathUtils.degToRad(90))
  applyTransformations(fence)
  fence.translateX(startPos.x)
  fence.translateY(startPos.y)
  fence.translateZ(startPos.z)
  return fence
}
