import { ArxPolygonFlags } from 'arx-convert/types'
import { QuadrupleOf } from 'arx-convert/utils'
import { BufferGeometry, Group, MathUtils, Object3D, Vector2 } from 'three'
import { ArxMap } from '@src/ArxMap.js'
import { Material } from '@src/Material.js'
import { DONT_QUADIFY, QUADIFY } from '@src/Polygons.js'
import { Vector3 } from '@src/Vector3.js'
import { TextureOrMaterial } from '@src/types.js'
import { createPlaneMesh } from '@prefabs/mesh/plane.js'
import { scaleUV } from '@tools/mesh/scaleUV.js'

export type TextureDefinition = {
  texture: TextureOrMaterial
  fitX: boolean
  fitY: boolean
  isRemoved: boolean
}

export type RoomTextures = {
  wall: TextureDefinition | QuadrupleOf<TextureDefinition>
  floor: TextureDefinition
  ceiling: TextureDefinition
}

export type RoomProps = {
  textures: RoomTextures
  /**
   * default value is 50
   */
  tileSize?: number
}

const fitUV = (
  {
    fitX,
    fitY,
    tileSize,
    size,
  }: {
    fitX: boolean
    fitY: boolean
    tileSize: number
    size: Vector2
  },
  geometry: BufferGeometry,
) => {
  if (fitX && fitY) {
    // stretch
    scaleUV(new Vector2(tileSize / size.x, tileSize / size.y), geometry)
  }
  if (fitX && !fitY) {
    // fit horizontally
    scaleUV(new Vector2(tileSize / size.x, tileSize / size.x), geometry)
  }
  if (!fitX && fitY) {
    // fit vertically
    scaleUV(new Vector2(tileSize / size.y, tileSize / size.y), geometry)
  }
  if (!fitX && !fitY) {
    // tile
    scaleUV(new Vector2(tileSize / 100, tileSize / 100), geometry)
  }
}

const createFloor = (size: Vector3, textureDef: TextureDefinition, tileSize: number) => {
  const { x: width, z: depth } = size
  const { texture, fitX, fitY } = textureDef
  const size2D = new Vector2(width, depth)

  const mesh = createPlaneMesh({
    size: size2D,
    tileSize,
    texture: Material.fromTexture(texture, {
      flags: fitX || fitY ? ArxPolygonFlags.Tiled : ArxPolygonFlags.None,
    }),
  })

  fitUV(
    {
      fitX,
      fitY,
      tileSize,
      size: size2D,
    },
    mesh.geometry,
  )

  return mesh
}

const createNorthWall = (size: Vector3, textureDef: TextureDefinition, tileSize: number) => {
  const { x: width, y: height, z: depth } = size
  const { texture, fitX, fitY } = textureDef
  const size2D = new Vector2(width, height)

  const mesh = createPlaneMesh({
    size: size2D,
    tileSize,
    texture: Material.fromTexture(texture, {
      flags: fitX || fitY ? ArxPolygonFlags.Tiled : ArxPolygonFlags.None,
    }),
  })
  mesh.translateZ(depth / 2).translateY(-height / 2)
  mesh.rotateX(MathUtils.degToRad(90))

  fitUV(
    {
      fitX,
      fitY,
      tileSize,
      size: size2D,
    },
    mesh.geometry,
  )

  return mesh
}

const createSouthWall = (size: Vector3, textureDef: TextureDefinition, tileSize: number) => {
  const { x: width, y: height, z: depth } = size
  const { texture, fitX, fitY } = textureDef
  const size2D = new Vector2(width, height)

  const mesh = createPlaneMesh({
    size: size2D,
    tileSize,
    texture: Material.fromTexture(texture, {
      flags: fitX || fitY ? ArxPolygonFlags.Tiled : ArxPolygonFlags.None,
    }),
  })
  mesh.translateZ(-depth / 2).translateY(-height / 2)
  mesh.rotateX(MathUtils.degToRad(90)).rotateZ(MathUtils.degToRad(180))

  fitUV(
    {
      fitX,
      fitY,
      tileSize,
      size: size2D,
    },
    mesh.geometry,
  )

  return mesh
}

const createWestWall = (size: Vector3, textureDef: TextureDefinition, tileSize: number) => {
  const { x: width, y: height, z: depth } = size
  const { texture, fitX, fitY } = textureDef
  const size2D = new Vector2(depth, height)

  const mesh = createPlaneMesh({
    size: size2D,
    tileSize,
    texture: Material.fromTexture(texture, {
      flags: fitX || fitY ? ArxPolygonFlags.Tiled : ArxPolygonFlags.None,
    }),
  })
  mesh.translateX(-width / 2).translateY(-height / 2)
  mesh.rotateX(MathUtils.degToRad(90)).rotateZ(MathUtils.degToRad(90))

  fitUV(
    {
      fitX,
      fitY,
      tileSize,
      size: size2D,
    },
    mesh.geometry,
  )

  return mesh
}

const createEastWall = (size: Vector3, textureDef: TextureDefinition, tileSize: number) => {
  const { x: width, y: height, z: depth } = size
  const { texture, fitX, fitY } = textureDef
  const size2D = new Vector2(depth, height)

  const mesh = createPlaneMesh({
    size: size2D,
    tileSize,
    texture: Material.fromTexture(texture, {
      flags: fitX || fitY ? ArxPolygonFlags.Tiled : ArxPolygonFlags.None,
    }),
  })
  mesh.translateX(width / 2).translateY(-height / 2)
  mesh.rotateX(MathUtils.degToRad(90)).rotateZ(MathUtils.degToRad(-90))

  fitUV(
    {
      fitX,
      fitY,
      tileSize,
      size: size2D,
    },
    mesh.geometry,
  )

  return mesh
}

const createCeiling = (size: Vector3, textureDef: TextureDefinition, tileSize: number) => {
  const { x: width, y: height, z: depth } = size
  const { texture, fitX, fitY } = textureDef
  const size2D = new Vector2(width, depth)

  const mesh = createPlaneMesh({
    size: size2D,
    tileSize,
    texture: Material.fromTexture(texture, {
      flags: fitX || fitY ? ArxPolygonFlags.Tiled : ArxPolygonFlags.None,
    }),
  })
  mesh.translateY(-height)
  mesh.rotateX(MathUtils.degToRad(180))

  fitUV(
    {
      fitX,
      fitY,
      tileSize,
      size: size2D,
    },
    mesh.geometry,
  )

  return mesh
}

export const createRoomMesh = (size: Vector3, { textures: { wall, floor, ceiling }, tileSize = 50 }: RoomProps) => {
  const walls = Array.isArray(wall) ? wall : [wall, wall, wall, wall]

  const group = new Group()

  if (!floor.isRemoved) {
    group.add(createFloor(size, floor, tileSize))
  }
  if (!walls[0].isRemoved) {
    group.add(createNorthWall(size, walls[0], tileSize))
  }
  if (!walls[1].isRemoved) {
    group.add(createEastWall(size, walls[1], tileSize))
  }
  if (!walls[2].isRemoved) {
    group.add(createSouthWall(size, walls[2], tileSize))
  }
  if (!walls[3].isRemoved) {
    group.add(createWestWall(size, walls[3], tileSize))
  }
  if (!ceiling.isRemoved) {
    group.add(createCeiling(size, ceiling, tileSize))
  }

  return group
}

export const createArxMapFromMesh = (mesh: Object3D, tryToQuadify?: typeof QUADIFY | typeof DONT_QUADIFY) => {
  return ArxMap.fromThreeJsMesh(mesh, { tryToQuadify })
}

export const createRoom = (
  dimensions: Vector3,
  props: RoomProps,
  tryToQuadify?: typeof QUADIFY | typeof DONT_QUADIFY,
) => {
  return createArxMapFromMesh(createRoomMesh(dimensions, props), tryToQuadify)
}
