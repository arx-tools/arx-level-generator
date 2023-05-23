import { ArxPolygonFlags } from 'arx-convert/types'
import { ArxMap } from '@src/ArxMap.js'
import { Color } from '@src/Color.js'
import { createPlaneMesh } from '@prefabs/mesh/plane.js'
import { Group, MathUtils, Object3D, Vector2 } from 'three'
import { Vector3 } from '@src/Vector3.js'
import { DONT_QUADIFY, QUADIFY } from '@src/Polygons.js'
import { scaleUV } from '@tools/mesh/scaleUV.js'
import { QuadrupleOf } from 'arx-convert/utils'
import { TextureOrMaterial } from '@src/types.js'

const TILE_SIZE = 50
const TILE_SCALE = new Vector2(TILE_SIZE / 100, TILE_SIZE / 100)

export type RoomTextures = {
  wall: TextureOrMaterial | QuadrupleOf<TextureOrMaterial>
  floor: TextureOrMaterial
  ceiling: TextureOrMaterial
}

export type RoomProps = {
  decal?: TextureOrMaterial
  textures: RoomTextures
}

const createFloor = async (dimensions: Vector3, texture: TextureOrMaterial) => {
  const { x: width, y: height, z: depth } = dimensions
  const mesh = await createPlaneMesh(new Vector2(width, depth), TILE_SIZE, Color.white.darken(70), texture)
  scaleUV(TILE_SCALE, mesh.geometry)
  return mesh
}

const createNorthWall = async (dimensions: Vector3, texture: TextureOrMaterial, decal?: TextureOrMaterial) => {
  const { x: width, y: height, z: depth } = dimensions

  const group = new Group()

  const wall = await createPlaneMesh(new Vector2(width, height), TILE_SIZE, Color.white.darken(50), texture)
  wall.translateZ(depth / 2).translateY(height / 2)
  wall.rotateX(MathUtils.degToRad(-90))
  scaleUV(TILE_SCALE, wall.geometry)
  group.add(wall)

  if (decal) {
    const decalOnWall = await createPlaneMesh(new Vector2(width, TILE_SIZE), TILE_SIZE, Color.white.darken(50), decal)
    decalOnWall.translateZ(depth / 2).translateY(50)
    decalOnWall.rotateX(MathUtils.degToRad(-90))
    scaleUV(TILE_SCALE, decalOnWall.geometry)
    group.add(decalOnWall)
  }

  return group
}

const createSouthWall = async (dimensions: Vector3, texture: TextureOrMaterial, decal?: TextureOrMaterial) => {
  const { x: width, y: height, z: depth } = dimensions

  const group = new Group()

  const wall = await createPlaneMesh(new Vector2(width, height), TILE_SIZE, Color.white.darken(50), texture)
  wall.translateZ(-depth / 2).translateY(height / 2)
  wall.rotateX(MathUtils.degToRad(-90)).rotateZ(MathUtils.degToRad(180))
  scaleUV(TILE_SCALE, wall.geometry)
  group.add(wall)

  if (decal) {
    const decalOnWall = await createPlaneMesh(new Vector2(width, TILE_SIZE), TILE_SIZE, Color.white.darken(50), decal)
    decalOnWall.translateZ(-depth / 2).translateY(50)
    decalOnWall.rotateX(MathUtils.degToRad(-90)).rotateZ(MathUtils.degToRad(180))
    scaleUV(TILE_SCALE, decalOnWall.geometry)
    group.add(decalOnWall)
  }

  return group
}

const createWestWall = async (dimensions: Vector3, texture: TextureOrMaterial, decal?: TextureOrMaterial) => {
  const { x: width, y: height, z: depth } = dimensions

  const group = new Group()

  const wall = await createPlaneMesh(new Vector2(depth, height), TILE_SIZE, Color.white.darken(50), texture)
  wall.translateX(-width / 2).translateY(height / 2)
  wall.rotateX(MathUtils.degToRad(-90)).rotateZ(MathUtils.degToRad(-90))
  scaleUV(TILE_SCALE, wall.geometry)
  group.add(wall)

  if (decal) {
    const decalOnWall = await createPlaneMesh(new Vector2(depth, TILE_SIZE), TILE_SIZE, Color.white.darken(50), decal)
    decalOnWall.translateX(-width / 2).translateY(50)
    decalOnWall.rotateX(MathUtils.degToRad(-90)).rotateZ(MathUtils.degToRad(-90))
    scaleUV(TILE_SCALE, decalOnWall.geometry)
    group.add(decalOnWall)
  }

  return group
}

const createEastWall = async (dimensions: Vector3, texture: TextureOrMaterial, decal?: TextureOrMaterial) => {
  const { x: width, y: height, z: depth } = dimensions

  const group = new Group()

  const wall = await createPlaneMesh(new Vector2(depth, height), TILE_SIZE, Color.white.darken(50), texture)
  wall.translateX(width / 2).translateY(height / 2)
  wall.rotateX(MathUtils.degToRad(-90)).rotateZ(MathUtils.degToRad(90))
  scaleUV(TILE_SCALE, wall.geometry)
  group.add(wall)

  if (decal) {
    const decalOnWall = await createPlaneMesh(new Vector2(depth, TILE_SIZE), TILE_SIZE, Color.white.darken(50), decal)
    decalOnWall.translateX(width / 2).translateY(50)
    decalOnWall.rotateX(MathUtils.degToRad(-90)).rotateZ(MathUtils.degToRad(90))
    scaleUV(TILE_SCALE, decalOnWall.geometry)
    group.add(decalOnWall)
  }

  return group
}

const createCeiling = async (dimensions: Vector3, texture: TextureOrMaterial) => {
  const { x: width, y: height, z: depth } = dimensions

  const mesh = await createPlaneMesh(new Vector2(width, depth), TILE_SIZE, Color.white.darken(50), texture)
  mesh.translateY(height)
  mesh.rotateX(MathUtils.degToRad(180))
  scaleUV(TILE_SCALE, mesh.geometry)
  return mesh
}

export const createRoomMesh = async (dimensions: Vector3, { decal, textures: { wall, floor, ceiling } }: RoomProps) => {
  const group = new Group()

  group.add(await createFloor(dimensions, floor))
  group.add(await createNorthWall(dimensions, Array.isArray(wall) ? wall[0] : wall, decal))
  group.add(await createEastWall(dimensions, Array.isArray(wall) ? wall[1] : wall, decal))
  group.add(await createSouthWall(dimensions, Array.isArray(wall) ? wall[2] : wall, decal))
  group.add(await createWestWall(dimensions, Array.isArray(wall) ? wall[3] : wall, decal))
  group.add(await createCeiling(dimensions, ceiling))

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
