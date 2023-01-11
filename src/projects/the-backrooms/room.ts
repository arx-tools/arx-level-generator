import { ArxPolygonFlags } from 'arx-convert/types'
import { ArxMap } from '@src/ArxMap'
import { Color } from '@src/Color'
import { createPlaneMesh } from '@prefabs/mesh/plane'
import { carpet, wallpaper, ceilingTile, mold } from './materials'
import { Group, MathUtils } from 'three'

const createFloor = async (width: number, height: number, depth: number) => {
  return await createPlaneMesh(width, depth, Color.white.darken(70), carpet)
}

const createNorthWall = async (width: number, height: number, depth: number) => {
  const group = new Group()

  const wall = await createPlaneMesh(width, height, Color.white.darken(50), wallpaper)
  wall.translateZ(depth / 2).translateY(height / 2)
  wall.rotateX(MathUtils.degToRad(-90))

  const moldyWall = await createPlaneMesh(width, 100, Color.white.darken(50), mold)
  moldyWall.translateZ(depth / 2 - 0.1).translateY(50)
  moldyWall.rotateX(MathUtils.degToRad(-90))

  group.add(wall)
  group.add(moldyWall)

  return group
}

const createSouthWall = async (width: number, height: number, depth: number) => {
  const group = new Group()

  const wall = await createPlaneMesh(width, height, Color.white.darken(50), wallpaper)
  wall.translateZ(-depth / 2).translateY(height / 2)
  wall.rotateX(MathUtils.degToRad(-90)).rotateZ(MathUtils.degToRad(180))

  const moldyWall = await createPlaneMesh(width, 100, Color.white.darken(50), mold)
  moldyWall.translateZ(-depth / 2 + 0.1).translateY(50)
  moldyWall.rotateX(MathUtils.degToRad(-90)).rotateZ(MathUtils.degToRad(180))

  group.add(wall)
  group.add(moldyWall)

  return group
}

const createWestWall = async (width: number, height: number, depth: number) => {
  const group = new Group()

  const wall = await createPlaneMesh(depth, height, Color.white.darken(50), wallpaper)
  wall.translateX(-width / 2).translateY(height / 2)
  wall.rotateX(MathUtils.degToRad(-90)).rotateZ(MathUtils.degToRad(-90))

  const moldyWall = await createPlaneMesh(depth, 100, Color.white.darken(50), mold)
  moldyWall.translateX(-width / 2 + 0.1).translateY(50)
  moldyWall.rotateX(MathUtils.degToRad(-90)).rotateZ(MathUtils.degToRad(-90))

  group.add(wall)
  group.add(moldyWall)

  return group
}

const createEastWall = async (width: number, height: number, depth: number) => {
  const group = new Group()

  const wall = await createPlaneMesh(depth, height, Color.white.darken(50), wallpaper)
  wall.translateX(width / 2).translateY(height / 2)
  wall.rotateX(MathUtils.degToRad(-90)).rotateZ(MathUtils.degToRad(90))

  const moldyWall = await createPlaneMesh(depth, 100, Color.white.darken(50), mold)
  moldyWall.translateX(width / 2 - 0.1).translateY(50)
  moldyWall.rotateX(MathUtils.degToRad(-90)).rotateZ(MathUtils.degToRad(90))

  group.add(wall)
  group.add(moldyWall)

  return group
}

const createCeiling = async (width: number, height: number, depth: number) => {
  const mesh = await createPlaneMesh(width, depth, Color.white.darken(50), ceilingTile)
  mesh.translateY(height)
  mesh.rotateX(MathUtils.degToRad(180))
  return mesh
}

export const createRoom = async (width: number, height: number, depth: number) => {
  const group = new Group()

  group.add(await createFloor(width, height, depth))
  group.add(await createNorthWall(width, height, depth))
  group.add(await createSouthWall(width, height, depth))
  group.add(await createWestWall(width, height, depth))
  group.add(await createEastWall(width, height, depth))
  group.add(await createCeiling(width, height, depth))

  group.rotateZ(MathUtils.degToRad(20))

  const room = ArxMap.fromThreeJsMesh(group)
  const moldTexture = await mold

  room.polygons.forEach((polygon) => {
    polygon.flags |= ArxPolygonFlags.Tiled
    if (polygon.texture === moldTexture) {
      polygon.setOpacity(50, 'subtractive')
    }
  })

  return room
}
