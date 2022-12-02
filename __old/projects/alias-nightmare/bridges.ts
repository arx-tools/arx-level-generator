import { without } from '../../faux-ramda'
import { NORTH, SOUTH, EAST, WEST } from './constants'
import { move, magnitude, subtractVec3, isBetweenInclusive, setTexture, MapData } from '../../helpers'
import { ISLAND_JOINT_LENGTH } from '../../constants'
import { surface } from '../../prefabs/base/surface'
import { textures } from '../../assets/textures'
import { Euler, Quaternion, Vector3 as ThreeJsVector3, MathUtils } from 'three'
import { Vector3 } from '../../types'

const jointOffset = (ISLAND_JOINT_LENGTH * 100) / 2 - 100

export type Island = {
  pos: Vector3
  entrances: number
  exits: number
  width: number
  height: number
}

export type Joints = {
  north?: Vector3
  south?: Vector3
  east?: Vector3
  west?: Vector3
}

const getJoints = ({ pos, entrances, exits, width, height }: Island) => {
  const joints: Joints = {}

  if ((exits | entrances) & NORTH) {
    joints.north = move(0, 0, (height * 100) / 2 + jointOffset + (ISLAND_JOINT_LENGTH * 100) / 2, pos)
  }

  if ((exits | entrances) & SOUTH) {
    joints.south = move(0, 0, -((height * 100) / 2 + jointOffset + (ISLAND_JOINT_LENGTH * 100) / 2), pos)
  }

  if ((exits | entrances) & EAST) {
    joints.east = move((width * 100) / 2 + jointOffset + (ISLAND_JOINT_LENGTH * 100) / 2, 0, 0, pos)
  }

  if ((exits | entrances) & WEST) {
    joints.west = move(-((width * 100) / 2 + jointOffset + (ISLAND_JOINT_LENGTH * 100) / 2), 0, 0, pos)
  }

  return joints
}

const findClosestJoint = (a: Vector3, bx: Vector3[]) => {
  if (bx.length === 1) {
    return bx[0]
  }

  const distances = bx.map((b) => Math.abs(magnitude(subtractVec3(a, b))))

  return bx[distances.indexOf(Math.min(...distances))]
}

const bridges = (islands: Island[], mapData: MapData) => {
  const pairs = islands
    .map(getJoints)
    .reduce((candidates, joint, idx, joints) => {
      const otherIslands = without([joint], joints)

      const viewAngle = 20

      if (joint.north) {
        const souths = otherIslands
          .filter(({ south }) => south !== undefined)
          .map(({ south }) => south)
          .filter((south) => {
            const [x, y, z] = subtractVec3(joint.north as Vector3, south as Vector3)
            const angle = MathUtils.radToDeg(Math.atan2(x, z))
            return isBetweenInclusive(-viewAngle, viewAngle, angle)
          })
        if (souths.length) {
          candidates.push([joint.north, findClosestJoint(joint.north, souths as Vector3[])])
        }
      }
      if (joint.south) {
        const norths = otherIslands
          .filter(({ north }) => north !== undefined)
          .map(({ north }) => north)
          .filter((north) => {
            const [x, y, z] = subtractVec3(joint.south as Vector3, north as Vector3)
            const angle = (MathUtils.radToDeg(Math.atan2(x, z)) + 180) % 360
            return isBetweenInclusive(-viewAngle, viewAngle, angle)
          })
        if (norths.length) {
          candidates.push([joint.south, findClosestJoint(joint.south, norths as Vector3[])])
        }
      }
      if (joint.east) {
        const wests = otherIslands
          .filter(({ west }) => west !== undefined)
          .map(({ west }) => west)
          .filter((west) => {
            const [x, y, z] = subtractVec3(joint.east as Vector3, west as Vector3)
            const angle = MathUtils.radToDeg(Math.atan2(x, z)) - 90
            return isBetweenInclusive(-viewAngle, viewAngle, angle)
          })
        if (wests.length) {
          candidates.push([joint.east, findClosestJoint(joint.east, wests as Vector3[])])
        }
      }
      if (joint.west) {
        const easts = otherIslands
          .filter(({ east }) => east !== undefined)
          .map(({ east }) => east)
          .filter((east) => {
            const [x, y, z] = subtractVec3(joint.west as Vector3, east as Vector3)
            const angle = MathUtils.radToDeg(Math.atan2(x, z)) + 90
            return isBetweenInclusive(-viewAngle, viewAngle, angle)
          })
        if (easts.length) {
          candidates.push([joint.west, findClosestJoint(joint.west, easts as Vector3[])])
        }
      }

      return candidates
    }, [] as [Vector3, Vector3][])
    .filter((pair, idx, pairs) => {
      // filter out pairs, which have no pair
      return pairs.map((pair) => JSON.stringify(pair)).includes(JSON.stringify([pair[1], pair[0]]))
    })
    .reduce((acc, pair) => {
      // duplicates can now be safely reduce into single pairs
      const accStr = acc.map((a) => JSON.stringify(a))
      if (accStr.includes(JSON.stringify(pair)) || accStr.includes(JSON.stringify([pair[1], pair[0]]))) {
        return acc
      }
      acc.push(pair)
      return acc
    }, [] as [Vector3, Vector3][])

  return pairs.reduce((mapData, [aCoords, bCoords]) => {
    const a = new ThreeJsVector3(...aCoords)
    const b = new ThreeJsVector3(...bCoords)

    const distance = a.distanceTo(b) + 1000

    a.normalize()
    b.normalize()

    const quaternion = new Quaternion()
    quaternion.setFromUnitVectors(a, b)

    const euler = new Euler()
    euler.setFromQuaternion(quaternion)

    const [aRad, bRad, gRad] = euler.toArray() as [number, number, number]

    const rotation = {
      a: MathUtils.radToDeg(aRad) + 90,
      b: MathUtils.radToDeg(bRad),
      g: MathUtils.radToDeg(gRad) + 180,
    }

    setTexture(textures.ground.moss, mapData)
    surface({ type: 'relative', coords: move(-150, 0, -500, aCoords) }, [300, distance], rotation)(mapData)

    return mapData
  }, mapData)
}

export default bridges
