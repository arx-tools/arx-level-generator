import { ArxPolygonFlags } from 'arx-convert/types'
import { QuadrupleOf } from 'arx-convert/utils'
import { Group, MathUtils, Object3D, Vector2 } from 'three'
import { ArxMap } from '@src/ArxMap.js'
import { Material } from '@src/Material.js'
import { DONT_QUADIFY, QUADIFY } from '@src/Polygons.js'
import { Vector3 } from '@src/Vector3.js'
import { applyTransformations } from '@src/helpers.js'
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

const createFloor = (size: Vector3, texture: TextureOrMaterial, tileSize: number) => {
  const { x: width, y: height, z: depth } = size

  const mesh = createPlaneMesh({
    size: new Vector2(width, depth),
    tileSize,
    texture: Material.fromTexture(texture, {
      flags: ArxPolygonFlags.Tiled,
    }),
  })

  scaleUV(new Vector2(tileSize / 100, tileSize / 100), mesh.geometry)

  return mesh
}

const createNorthWall = (size: Vector3, texture: TextureOrMaterial, tileSize: number, decal?: TextureOrMaterial) => {
  const { x: width, y: height, z: depth } = size

  const group = new Group()

  const wall = createPlaneMesh({
    size: new Vector2(width, height),
    tileSize,
    texture: Material.fromTexture(texture, {
      flags: ArxPolygonFlags.Tiled,
    }),
  })
  wall.translateZ(depth / 2).translateY(-height / 2)
  wall.rotateX(MathUtils.degToRad(90))
  const fitX = false
  const fitY = texture.filename.toLowerCase().includes('forest')
  if (fitX) {
    scaleUV(new Vector2(tileSize / width, tileSize / width), wall.geometry)
  } else if (fitY) {
    scaleUV(new Vector2(tileSize / height, tileSize / height), wall.geometry)
  } else {
    scaleUV(new Vector2(tileSize / 100, tileSize / 100), wall.geometry)
  }
  group.add(wall)

  if (decal) {
    const decalOnWall = createPlaneMesh({
      size: new Vector2(width, tileSize),
      tileSize,
      texture: Material.fromTexture(decal, {
        flags: ArxPolygonFlags.Tiled,
      }),
    })
    decalOnWall.translateZ(depth / 2).translateY(-50)
    decalOnWall.rotateX(MathUtils.degToRad(90))
    scaleUV(new Vector2(tileSize / 100, tileSize / 100), decalOnWall.geometry)
    group.add(decalOnWall)
  }

  return group
}

const createSouthWall = (size: Vector3, texture: TextureOrMaterial, tileSize: number, decal?: TextureOrMaterial) => {
  const { x: width, y: height, z: depth } = size

  const group = new Group()

  const wall = createPlaneMesh({
    size: new Vector2(width, height),
    tileSize,
    texture: Material.fromTexture(texture, {
      flags: ArxPolygonFlags.Tiled,
    }),
  })
  wall.translateZ(-depth / 2).translateY(-height / 2)
  wall.rotateX(MathUtils.degToRad(90)).rotateZ(MathUtils.degToRad(180))
  const fitX = false
  const fitY = texture.filename.toLowerCase().includes('forest')
  if (fitX) {
    scaleUV(new Vector2(tileSize / width, tileSize / width), wall.geometry)
  } else if (fitY) {
    scaleUV(new Vector2(tileSize / height, tileSize / height), wall.geometry)
  } else {
    scaleUV(new Vector2(tileSize / 100, tileSize / 100), wall.geometry)
  }
  group.add(wall)

  if (decal) {
    const decalOnWall = createPlaneMesh({
      size: new Vector2(width, tileSize),
      tileSize,
      texture: Material.fromTexture(decal, {
        flags: ArxPolygonFlags.Tiled,
      }),
      tileUV: !texture.filename.toLowerCase().includes('forest'),
    })
    decalOnWall.translateZ(-depth / 2).translateY(-50)
    decalOnWall.rotateX(MathUtils.degToRad(90)).rotateZ(MathUtils.degToRad(180))
    scaleUV(new Vector2(tileSize / 100, tileSize / 100), decalOnWall.geometry)
    group.add(decalOnWall)
  }

  return group
}

const createWestWall = (size: Vector3, texture: TextureOrMaterial, tileSize: number, decal?: TextureOrMaterial) => {
  const { x: width, y: height, z: depth } = size

  const group = new Group()

  const wall = createPlaneMesh({
    size: new Vector2(depth, height),
    tileSize,
    texture: Material.fromTexture(texture, {
      flags: ArxPolygonFlags.Tiled,
    }),
  })
  wall.translateX(-width / 2).translateY(-height / 2)
  wall.rotateX(MathUtils.degToRad(90)).rotateZ(MathUtils.degToRad(90))
  const fitX = false
  const fitY = texture.filename.toLowerCase().includes('forest')
  if (fitX) {
    scaleUV(new Vector2(tileSize / width, tileSize / width), wall.geometry)
  } else if (fitY) {
    scaleUV(new Vector2(tileSize / height, tileSize / height), wall.geometry)
  } else {
    scaleUV(new Vector2(tileSize / 100, tileSize / 100), wall.geometry)
  }
  group.add(wall)

  if (decal) {
    const decalOnWall = createPlaneMesh({
      size: new Vector2(depth, tileSize),
      tileSize,
      texture: Material.fromTexture(decal, {
        flags: ArxPolygonFlags.Tiled,
      }),
      tileUV: !texture.filename.toLowerCase().includes('forest'),
    })
    decalOnWall.translateX(-width / 2).translateY(-50)
    decalOnWall.rotateX(MathUtils.degToRad(90)).rotateZ(MathUtils.degToRad(90))
    scaleUV(new Vector2(tileSize / 100, tileSize / 100), decalOnWall.geometry)
    group.add(decalOnWall)
  }

  return group
}

const createEastWall = (size: Vector3, texture: TextureOrMaterial, tileSize: number, decal?: TextureOrMaterial) => {
  const { x: width, y: height, z: depth } = size

  const group = new Group()

  const wall = createPlaneMesh({
    size: new Vector2(depth, height),
    tileSize,
    texture: Material.fromTexture(texture, {
      flags: ArxPolygonFlags.Tiled,
    }),
  })
  wall.translateX(width / 2).translateY(-height / 2)
  wall.rotateX(MathUtils.degToRad(90)).rotateZ(MathUtils.degToRad(-90))
  const fitX = false
  const fitY = texture.filename.toLowerCase().includes('forest')
  if (fitX) {
    scaleUV(new Vector2(tileSize / width, tileSize / width), wall.geometry)
  } else if (fitY) {
    scaleUV(new Vector2(tileSize / height, tileSize / height), wall.geometry)
  } else {
    scaleUV(new Vector2(tileSize / 100, tileSize / 100), wall.geometry)
  }
  group.add(wall)

  if (decal) {
    const decalOnWall = createPlaneMesh({
      size: new Vector2(depth, tileSize),
      tileSize,
      texture: Material.fromTexture(decal, {
        flags: ArxPolygonFlags.Tiled,
      }),
      tileUV: !texture.filename.toLowerCase().includes('forest'),
    })
    decalOnWall.translateX(width / 2).translateY(-50)
    decalOnWall.rotateX(MathUtils.degToRad(90)).rotateZ(MathUtils.degToRad(-90))
    scaleUV(new Vector2(tileSize / 100, tileSize / 100), decalOnWall.geometry)
    group.add(decalOnWall)
  }

  return group
}

const createCeiling = (size: Vector3, texture: TextureOrMaterial, tileSize: number) => {
  const { x: width, y: height, z: depth } = size

  const mesh = createPlaneMesh({
    size: new Vector2(width, depth),
    tileSize,
    texture: Material.fromTexture(texture, {
      flags: ArxPolygonFlags.Tiled,
    }),
  })
  mesh.translateY(-height)
  mesh.rotateX(MathUtils.degToRad(180))

  scaleUV(new Vector2(tileSize / 100, tileSize / 100), mesh.geometry)
  applyTransformations(mesh)
  return mesh
}

export const createRoomMesh = (
  size: Vector3,
  { decal, textures: { wall, floor, ceiling }, tileSize = 50 }: RoomProps,
) => {
  const group = new Group()

  group.add(createFloor(size, floor, tileSize))
  group.add(createNorthWall(size, Array.isArray(wall) ? wall[0] : wall, tileSize, decal))
  group.add(createEastWall(size, Array.isArray(wall) ? wall[1] : wall, tileSize, decal))
  group.add(createSouthWall(size, Array.isArray(wall) ? wall[2] : wall, tileSize, decal))
  group.add(createWestWall(size, Array.isArray(wall) ? wall[3] : wall, tileSize, decal))
  group.add(createCeiling(size, ceiling, tileSize))

  return group
}

export const createArxMapFromMesh = (mesh: Object3D, tryToQuadify: typeof QUADIFY | typeof DONT_QUADIFY = QUADIFY) => {
  return ArxMap.fromThreeJsMesh(mesh, { tryToQuadify })
}

export const createRoom = (dimensions: Vector3, props: RoomProps) => {
  return createArxMapFromMesh(createRoomMesh(dimensions, props))
}
