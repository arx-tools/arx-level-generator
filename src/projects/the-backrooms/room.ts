import { ArxPolygonFlags } from 'arx-convert/types'
import { ArxMap } from '@src/ArxMap'
import { Color } from '@src/Color'
import { createPlaneMesh } from '@prefabs/mesh/plane'
import { mold } from '@projects/the-backrooms/materials'
import { Group, MathUtils, Object3D, Vector2 } from 'three'
import { Vector3 } from '@src/Vector3'
import { Texture } from '@src/Texture'
import { DONT_QUADIFY, QUADIFY } from '@src/Polygons'

const TILE_SIZE = 100

// TODO: scale texture

export type RoomTextures = {
  wall: Texture | Promise<Texture>
  floor: Texture | Promise<Texture>
  ceiling: Texture | Promise<Texture>
}

export type RoomProps = {
  hasMold: boolean
  textures: RoomTextures
}

const createFloor = async (dimensions: Vector3, texture: Texture | Promise<Texture>) => {
  const { x: width, y: height, z: depth } = dimensions
  return await createPlaneMesh(new Vector2(width, depth), TILE_SIZE, Color.white.darken(70), texture)
}

const createNorthWall = async (
  dimensions: Vector3,
  hasMold: boolean,
  moldOffset: number,
  texture: Texture | Promise<Texture>,
) => {
  const { x: width, y: height, z: depth } = dimensions

  const group = new Group()

  const wall = await createPlaneMesh(new Vector2(width, height), TILE_SIZE, Color.white.darken(50), texture)
  wall.translateZ(depth / 2).translateY(height / 2)
  wall.rotateX(MathUtils.degToRad(-90))
  group.add(wall)

  if (hasMold) {
    const moldyWall = await createPlaneMesh(new Vector2(width, TILE_SIZE), TILE_SIZE, Color.white.darken(50), mold)
    moldyWall.translateZ(depth / 2 - moldOffset).translateY(50)
    moldyWall.rotateX(MathUtils.degToRad(-90))
    group.add(moldyWall)
  }

  return group
}

const createSouthWall = async (
  dimensions: Vector3,
  hasMold: boolean,
  moldOffset: number,
  texture: Texture | Promise<Texture>,
) => {
  const { x: width, y: height, z: depth } = dimensions

  const group = new Group()

  const wall = await createPlaneMesh(new Vector2(width, height), TILE_SIZE, Color.white.darken(50), texture)
  wall.translateZ(-depth / 2).translateY(height / 2)
  wall.rotateX(MathUtils.degToRad(-90)).rotateZ(MathUtils.degToRad(180))
  group.add(wall)

  if (hasMold) {
    const moldyWall = await createPlaneMesh(new Vector2(width, TILE_SIZE), TILE_SIZE, Color.white.darken(50), mold)
    moldyWall.translateZ(-depth / 2 + moldOffset).translateY(50)
    moldyWall.rotateX(MathUtils.degToRad(-90)).rotateZ(MathUtils.degToRad(180))
    group.add(moldyWall)
  }

  return group
}

const createWestWall = async (
  dimensions: Vector3,
  hasMold: boolean,
  moldOffset: number,
  texture: Texture | Promise<Texture>,
) => {
  const { x: width, y: height, z: depth } = dimensions

  const group = new Group()

  const wall = await createPlaneMesh(new Vector2(depth, height), TILE_SIZE, Color.white.darken(50), texture)
  wall.translateX(-width / 2).translateY(height / 2)
  wall.rotateX(MathUtils.degToRad(-90)).rotateZ(MathUtils.degToRad(-90))
  group.add(wall)

  if (hasMold) {
    const moldyWall = await createPlaneMesh(new Vector2(depth, TILE_SIZE), TILE_SIZE, Color.white.darken(50), mold)
    moldyWall.translateX(-width / 2 + moldOffset).translateY(50)
    moldyWall.rotateX(MathUtils.degToRad(-90)).rotateZ(MathUtils.degToRad(-90))
    group.add(moldyWall)
  }

  return group
}

const createEastWall = async (
  dimensions: Vector3,
  hasMold: boolean,
  moldOffset: number,
  texture: Texture | Promise<Texture>,
) => {
  const { x: width, y: height, z: depth } = dimensions

  const group = new Group()

  const wall = await createPlaneMesh(new Vector2(depth, height), TILE_SIZE, Color.white.darken(50), texture)
  wall.translateX(width / 2).translateY(height / 2)
  wall.rotateX(MathUtils.degToRad(-90)).rotateZ(MathUtils.degToRad(90))
  group.add(wall)

  if (hasMold) {
    const moldyWall = await createPlaneMesh(new Vector2(depth, TILE_SIZE), TILE_SIZE, Color.white.darken(50), mold)
    moldyWall.translateX(width / 2 - moldOffset).translateY(50)
    moldyWall.rotateX(MathUtils.degToRad(-90)).rotateZ(MathUtils.degToRad(90))
    group.add(moldyWall)
  }

  return group
}

const createCeiling = async (dimensions: Vector3, texture: Texture | Promise<Texture>) => {
  const { x: width, y: height, z: depth } = dimensions

  const mesh = await createPlaneMesh(new Vector2(width, depth), TILE_SIZE, Color.white.darken(50), texture)
  mesh.translateY(height)
  mesh.rotateX(MathUtils.degToRad(180))
  return mesh
}

export const createRoomMesh = async (
  dimensions: Vector3,
  { hasMold, textures: { wall, floor, ceiling } }: RoomProps,
) => {
  const moldOffset = 0 // TODO: if moldOffset is not 0, then union is not removing it with the wall

  const group = new Group()

  group.add(await createFloor(dimensions, floor))
  group.add(await createNorthWall(dimensions, hasMold, moldOffset, wall))
  group.add(await createSouthWall(dimensions, hasMold, moldOffset, wall))
  group.add(await createWestWall(dimensions, hasMold, moldOffset, wall))
  group.add(await createEastWall(dimensions, hasMold, moldOffset, wall))
  group.add(await createCeiling(dimensions, ceiling))

  return group
}

export const createRoomFromMesh = async (
  mesh: Object3D,
  tryToQuadify: typeof QUADIFY | typeof DONT_QUADIFY = QUADIFY,
) => {
  const room = ArxMap.fromThreeJsMesh(mesh, { tryToQuadify })
  const moldTexture = await mold

  room.polygons.forEach((polygon) => {
    polygon.flags |= ArxPolygonFlags.Tiled
    if (polygon.texture === moldTexture) {
      polygon.setOpacity(50, 'subtractive')
    }
  })

  return room
}

export const createRoom = async (dimensions: Vector3, props: RoomProps) => {
  return await createRoomFromMesh(await createRoomMesh(dimensions, props))
}
