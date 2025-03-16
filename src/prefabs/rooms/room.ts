import { ArxPolygonFlags } from 'arx-convert/types'
import type { QuadrupleOf } from 'arx-convert/utils'
import { type BufferGeometry, Group, MathUtils, type Mesh, type Object3D, Vector2 } from 'three'
import { ArxMap } from '@src/ArxMap.js'
import { Material } from '@src/Material.js'
import type { DONT_QUADIFY, QUADIFY } from '@src/Polygons.js'
import type { Vector3 } from '@src/Vector3.js'
import type { TextureOrMaterial } from '@src/types.js'
import { createPlaneMesh } from '@prefabs/mesh/plane.js'
import { scaleUV } from '@tools/mesh/scaleUV.js'

export type TextureDefinition = {
  texture: TextureOrMaterial
  fitX: boolean
  fitY: boolean
  isRemoved: boolean
  scale: number
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

function fitUV(
  {
    fitX,
    fitY,
    scale,
    tileSize,
    size,
  }: {
    fitX: boolean
    fitY: boolean
    scale: number
    tileSize: number
    size: Vector2
  },
  geometry: BufferGeometry,
): void {
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
    scaleUV(new Vector2(tileSize / (100 * scale), tileSize / (100 * scale)), geometry)
  }
}

function createFloor(size: Vector3, textureDef: TextureDefinition, tileSize: number): Mesh {
  const { x: width, z: depth } = size
  const { texture, fitX, fitY, scale } = textureDef
  const size2D = new Vector2(width, depth)

  let flags: ArxPolygonFlags
  if (fitX && fitY) {
    flags = ArxPolygonFlags.None
  } else {
    flags = ArxPolygonFlags.Tiled
  }

  const mesh = createPlaneMesh({
    size: size2D,
    tileSize,
    texture: Material.fromTexture(texture, {
      flags,
    }),
  })

  fitUV(
    {
      fitX,
      fitY,
      scale,
      tileSize,
      size: size2D,
    },
    mesh.geometry,
  )

  return mesh
}

function createNorthWall(size: Vector3, textureDef: TextureDefinition, tileSize: number): Mesh {
  const { x: width, y: height, z: depth } = size
  const { texture, fitX, fitY, scale } = textureDef
  const size2D = new Vector2(width, height)

  let flags: ArxPolygonFlags
  if (fitX && fitY) {
    flags = ArxPolygonFlags.None
  } else {
    flags = ArxPolygonFlags.Tiled
  }

  const mesh = createPlaneMesh({
    size: size2D,
    tileSize,
    texture: Material.fromTexture(texture, {
      flags,
    }),
  })
  mesh.translateZ(depth / 2).translateY(-height / 2)
  mesh.rotateX(MathUtils.degToRad(90))

  fitUV(
    {
      fitX,
      fitY,
      scale,
      tileSize,
      size: size2D,
    },
    mesh.geometry,
  )

  return mesh
}

function createSouthWall(size: Vector3, textureDef: TextureDefinition, tileSize: number): Mesh {
  const { x: width, y: height, z: depth } = size
  const { texture, fitX, fitY, scale } = textureDef
  const size2D = new Vector2(width, height)

  let flags: ArxPolygonFlags
  if (fitX && fitY) {
    flags = ArxPolygonFlags.None
  } else {
    flags = ArxPolygonFlags.Tiled
  }

  const mesh = createPlaneMesh({
    size: size2D,
    tileSize,
    texture: Material.fromTexture(texture, {
      flags,
    }),
  })
  mesh.translateZ(-depth / 2).translateY(-height / 2)
  mesh.rotateX(MathUtils.degToRad(90)).rotateZ(MathUtils.degToRad(180))

  fitUV(
    {
      fitX,
      fitY,
      scale,
      tileSize,
      size: size2D,
    },
    mesh.geometry,
  )

  return mesh
}

function createWestWall(size: Vector3, textureDef: TextureDefinition, tileSize: number): Mesh {
  const { x: width, y: height, z: depth } = size
  const { texture, fitX, fitY, scale } = textureDef
  const size2D = new Vector2(depth, height)

  let flags: ArxPolygonFlags
  if (fitX && fitY) {
    flags = ArxPolygonFlags.None
  } else {
    flags = ArxPolygonFlags.Tiled
  }

  const mesh = createPlaneMesh({
    size: size2D,
    tileSize,
    texture: Material.fromTexture(texture, {
      flags,
    }),
  })
  mesh.translateX(-width / 2).translateY(-height / 2)
  mesh.rotateX(MathUtils.degToRad(90)).rotateZ(MathUtils.degToRad(90))

  fitUV(
    {
      fitX,
      fitY,
      scale,
      tileSize,
      size: size2D,
    },
    mesh.geometry,
  )

  return mesh
}

function createEastWall(size: Vector3, textureDef: TextureDefinition, tileSize: number): Mesh {
  const { x: width, y: height, z: depth } = size
  const { texture, fitX, fitY, scale } = textureDef
  const size2D = new Vector2(depth, height)

  let flags: ArxPolygonFlags
  if (fitX && fitY) {
    flags = ArxPolygonFlags.None
  } else {
    flags = ArxPolygonFlags.Tiled
  }

  const mesh = createPlaneMesh({
    size: size2D,
    tileSize,
    texture: Material.fromTexture(texture, {
      flags,
    }),
  })
  mesh.translateX(width / 2).translateY(-height / 2)
  mesh.rotateX(MathUtils.degToRad(90)).rotateZ(MathUtils.degToRad(-90))

  fitUV(
    {
      fitX,
      fitY,
      scale,
      tileSize,
      size: size2D,
    },
    mesh.geometry,
  )

  return mesh
}

function createCeiling(size: Vector3, textureDef: TextureDefinition, tileSize: number): Mesh {
  const { x: width, y: height, z: depth } = size
  const { texture, fitX, fitY, scale } = textureDef
  const size2D = new Vector2(width, depth)

  let flags: ArxPolygonFlags
  if (fitX && fitY) {
    flags = ArxPolygonFlags.None
  } else {
    flags = ArxPolygonFlags.Tiled
  }

  const mesh = createPlaneMesh({
    size: size2D,
    tileSize,
    texture: Material.fromTexture(texture, {
      flags,
    }),
  })
  mesh.translateY(-height)
  mesh.rotateX(MathUtils.degToRad(180))

  fitUV(
    {
      fitX,
      fitY,
      scale,
      tileSize,
      size: size2D,
    },
    mesh.geometry,
  )

  return mesh
}

function createRoomMesh(size: Vector3, { textures: { wall, floor, ceiling }, tileSize = 50 }: RoomProps): Group {
  let walls: QuadrupleOf<TextureDefinition>
  if (Array.isArray(wall)) {
    walls = wall
  } else {
    walls = [wall, wall, wall, wall]
  }

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

function createArxMapFromMesh(mesh: Object3D, tryToQuadify?: typeof QUADIFY | typeof DONT_QUADIFY): ArxMap {
  return ArxMap.fromThreeJsMesh(mesh, { tryToQuadify })
}

export function createRoom(
  dimensions: Vector3,
  props: RoomProps,
  tryToQuadify?: typeof QUADIFY | typeof DONT_QUADIFY,
): ArxMap {
  return createArxMapFromMesh(createRoomMesh(dimensions, props), tryToQuadify)
}
