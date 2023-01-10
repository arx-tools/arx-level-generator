import { ArxPolygonFlags } from 'arx-convert/types'
import { ArxMap } from '@src/ArxMap'
import { Color } from '@src/Color'
import { createPlaneMesh } from '@prefabs/mesh/plane'
import { carpet, wallpaper, ceilingTile } from './materials'
import { applyTransformations } from '@src/helpers'
import { MathUtils } from 'three'
import { Vector3 } from '@src/Vector3'

const createFloor = async (width: number, height: number, depth: number) => {
  const mesh = await createPlaneMesh(width, depth, Color.white.darken(50), carpet)

  return ArxMap.fromThreeJsMesh(mesh)
}

const createNorthWall = async (width: number, height: number, depth: number) => {
  const mesh = await createPlaneMesh(width, height, Color.white.darken(50), wallpaper)
  mesh.rotateX(MathUtils.degToRad(-90))
  applyTransformations(mesh)
  mesh.translateZ(depth / 2).translateY(height / 2)
  applyTransformations(mesh)

  return ArxMap.fromThreeJsMesh(mesh)
}

const createSouthWall = async (width: number, height: number, depth: number) => {
  const mesh = await createPlaneMesh(width, height, Color.white.darken(50), wallpaper)
  mesh.rotateX(MathUtils.degToRad(-90)).rotateZ(MathUtils.degToRad(180))
  applyTransformations(mesh)
  mesh.translateZ(-depth / 2).translateY(height / 2)
  applyTransformations(mesh)

  return ArxMap.fromThreeJsMesh(mesh)
}

const createWestWall = async (width: number, height: number, depth: number) => {
  const mesh = await createPlaneMesh(width, height, Color.white.darken(50), wallpaper)
  mesh.rotateX(MathUtils.degToRad(-90)).rotateZ(MathUtils.degToRad(-90))
  applyTransformations(mesh)
  mesh.translateX(-width / 2).translateY(height / 2)
  applyTransformations(mesh)

  return ArxMap.fromThreeJsMesh(mesh)
}

const createEastWall = async (width: number, height: number, depth: number) => {
  const mesh = await createPlaneMesh(width, height, Color.white.darken(50), wallpaper)
  mesh.rotateX(MathUtils.degToRad(-90)).rotateZ(MathUtils.degToRad(90))
  applyTransformations(mesh)
  mesh.translateX(width / 2).translateY(height / 2)
  applyTransformations(mesh)

  return ArxMap.fromThreeJsMesh(mesh)
}

const createCeiling = async (width: number, height: number, depth: number) => {
  const mesh = await createPlaneMesh(width, depth, Color.white.darken(50), ceilingTile)
  mesh.rotateX(MathUtils.degToRad(180))
  applyTransformations(mesh)
  mesh.translateY(height)
  applyTransformations(mesh)

  return ArxMap.fromThreeJsMesh(mesh)
}

export const createRoom = async (width: number, height: number, depth: number) => {
  const room = new ArxMap()

  room.add(await createFloor(width, height, depth), true)
  room.add(await createNorthWall(width, height, depth), true)
  room.add(await createSouthWall(width, height, depth), true)
  room.add(await createWestWall(width, height, depth), true)
  room.add(await createEastWall(width, height, depth), true)
  room.add(await createCeiling(width, height, depth), true)

  room.polygons.forEach((polygon) => {
    polygon.flags |= ArxPolygonFlags.Tiled
  })

  return room
}
