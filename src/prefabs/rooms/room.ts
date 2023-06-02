import { QuadrupleOf } from 'arx-convert/utils'
import { Group, MathUtils, Object3D, Vector2 } from 'three'
import { ArxMap } from '@src/ArxMap.js'
import { Color } from '@src/Color.js'
import { DONT_QUADIFY, QUADIFY } from '@src/Polygons.js'
import { Vector3 } from '@src/Vector3.js'
import { TextureOrMaterial } from '@src/types.js'
import { createPlaneMesh } from '@prefabs/mesh/plane.js'
import { scaleUV } from '@tools/mesh/scaleUV.js'

export type RoomTextures = {
  wall: TextureOrMaterial | QuadrupleOf<TextureOrMaterial>
  floor: TextureOrMaterial
  ceiling: TextureOrMaterial
}

export type RoomProps = {
  decal?: TextureOrMaterial
  textures: RoomTextures
  /**
   * @default 50
   */
  tileSize?: number
}

const createFloor = async (dimensions: Vector3, texture: TextureOrMaterial, tileSize: number) => {
  const { x: width, y: height, z: depth } = dimensions
  const mesh = await createPlaneMesh(new Vector2(width, depth), tileSize, Color.white, texture)
  scaleUV(new Vector2(tileSize / 100, tileSize / 100), mesh.geometry)
  return mesh
}

const createNorthWall = async (
  dimensions: Vector3,
  texture: TextureOrMaterial,
  tileSize: number,
  decal?: TextureOrMaterial,
) => {
  const { x: width, y: height, z: depth } = dimensions

  const group = new Group()

  const wall = await createPlaneMesh(new Vector2(width, height), tileSize, Color.white, texture)
  wall.translateZ(depth / 2).translateY(-height / 2)
  wall.rotateX(MathUtils.degToRad(90))
  scaleUV(new Vector2(tileSize / 100, tileSize / 100), wall.geometry)
  group.add(wall)

  if (decal) {
    const decalOnWall = await createPlaneMesh(new Vector2(width, tileSize), tileSize, Color.white, decal)
    decalOnWall.translateZ(depth / 2).translateY(-50)
    decalOnWall.rotateX(MathUtils.degToRad(90))
    scaleUV(new Vector2(tileSize / 100, tileSize / 100), decalOnWall.geometry)
    group.add(decalOnWall)
  }

  return group
}

const createSouthWall = async (
  dimensions: Vector3,
  texture: TextureOrMaterial,
  tileSize: number,
  decal?: TextureOrMaterial,
) => {
  const { x: width, y: height, z: depth } = dimensions

  const group = new Group()

  const wall = await createPlaneMesh(new Vector2(width, height), tileSize, Color.white, texture)
  wall.translateZ(-depth / 2).translateY(-height / 2)
  wall.rotateX(MathUtils.degToRad(90)).rotateZ(MathUtils.degToRad(180))
  scaleUV(new Vector2(tileSize / 100, tileSize / 100), wall.geometry)
  group.add(wall)

  if (decal) {
    const decalOnWall = await createPlaneMesh(new Vector2(width, tileSize), tileSize, Color.white, decal)
    decalOnWall.translateZ(-depth / 2).translateY(-50)
    decalOnWall.rotateX(MathUtils.degToRad(90)).rotateZ(MathUtils.degToRad(180))
    scaleUV(new Vector2(tileSize / 100, tileSize / 100), decalOnWall.geometry)
    group.add(decalOnWall)
  }

  return group
}

const createWestWall = async (
  dimensions: Vector3,
  texture: TextureOrMaterial,
  tileSize: number,
  decal?: TextureOrMaterial,
) => {
  const { x: width, y: height, z: depth } = dimensions

  const group = new Group()

  const wall = await createPlaneMesh(new Vector2(depth, height), tileSize, Color.white, texture)
  wall.translateX(-width / 2).translateY(-height / 2)
  wall.rotateX(MathUtils.degToRad(90)).rotateZ(MathUtils.degToRad(90))
  scaleUV(new Vector2(tileSize / 100, tileSize / 100), wall.geometry)
  group.add(wall)

  if (decal) {
    const decalOnWall = await createPlaneMesh(new Vector2(depth, tileSize), tileSize, Color.white, decal)
    decalOnWall.translateX(-width / 2).translateY(-50)
    decalOnWall.rotateX(MathUtils.degToRad(90)).rotateZ(MathUtils.degToRad(90))
    scaleUV(new Vector2(tileSize / 100, tileSize / 100), decalOnWall.geometry)
    group.add(decalOnWall)
  }

  return group
}

const createEastWall = async (
  dimensions: Vector3,
  texture: TextureOrMaterial,
  tileSize: number,
  decal?: TextureOrMaterial,
) => {
  const { x: width, y: height, z: depth } = dimensions

  const group = new Group()

  const wall = await createPlaneMesh(new Vector2(depth, height), tileSize, Color.white, texture)
  wall.translateX(width / 2).translateY(-height / 2)
  wall.rotateX(MathUtils.degToRad(90)).rotateZ(MathUtils.degToRad(-90))
  scaleUV(new Vector2(tileSize / 100, tileSize / 100), wall.geometry)
  group.add(wall)

  if (decal) {
    const decalOnWall = await createPlaneMesh(new Vector2(depth, tileSize), tileSize, Color.white, decal)
    decalOnWall.translateX(width / 2).translateY(-50)
    decalOnWall.rotateX(MathUtils.degToRad(90)).rotateZ(MathUtils.degToRad(-90))
    scaleUV(new Vector2(tileSize / 100, tileSize / 100), decalOnWall.geometry)
    group.add(decalOnWall)
  }

  return group
}

const createCeiling = async (dimensions: Vector3, texture: TextureOrMaterial, tileSize: number) => {
  const { x: width, y: height, z: depth } = dimensions

  const mesh = await createPlaneMesh(new Vector2(width, depth), tileSize, Color.white, texture)
  mesh.translateY(-height)
  mesh.rotateX(MathUtils.degToRad(180))
  scaleUV(new Vector2(tileSize / 100, tileSize / 100), mesh.geometry)
  return mesh
}

export const createRoomMesh = async (
  dimensions: Vector3,
  { decal, textures: { wall, floor, ceiling }, tileSize = 50 }: RoomProps,
) => {
  const group = new Group()

  group.add(await createFloor(dimensions, floor, tileSize))
  group.add(await createNorthWall(dimensions, Array.isArray(wall) ? wall[0] : wall, tileSize, decal))
  group.add(await createEastWall(dimensions, Array.isArray(wall) ? wall[1] : wall, tileSize, decal))
  group.add(await createSouthWall(dimensions, Array.isArray(wall) ? wall[2] : wall, tileSize, decal))
  group.add(await createWestWall(dimensions, Array.isArray(wall) ? wall[3] : wall, tileSize, decal))
  group.add(await createCeiling(dimensions, ceiling, tileSize))

  return group
}

export const createRoomFromMesh = async (
  mesh: Object3D,
  tryToQuadify: typeof QUADIFY | typeof DONT_QUADIFY = QUADIFY,
) => {
  return ArxMap.fromThreeJsMesh(mesh, { tryToQuadify })
}

export const createRoom = async (dimensions: Vector3, props: RoomProps) => {
  return await createRoomFromMesh(await createRoomMesh(dimensions, props))
}
