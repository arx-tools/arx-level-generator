import { Euler, Vector3, MathUtils } from 'three'
import { TextureDefinition, useTexture } from '../../assets/textures'
import { POLY_QUAD, POLY_NO_SHADOW } from '../../constants'
import { evenAndRemainder, MapData } from '../../helpers'
import { Polygon, RelativeCoords } from '../../types'
import { ArxRotation } from 'arx-level-json-converter/types/binary/BinaryIO'

const toAbsoluteCoords = (pos: RelativeCoords, mapData: MapData) => {
  const coords = new Vector3()
  coords.fromArray(mapData.config.origin.coords)
  coords.add(new Vector3(...pos.coords))
  return {
    type: 'absolute',
    coords: coords.toArray(),
  }
}

const generalBlock = (
  [sizeX, sizeY, sizeZ]: [number, number, number],
  rotation: Euler,
  xyz: Vector3,
  positionOffset: Vector3,
  [offsetU, offsetV]: [number, number],
  [scaleU, scaleV]: [number, number],
  texture: TextureDefinition | null,
  textureFlags: number,
  area: number,
  mapData: MapData,
) => {
  const v0 = new Vector3(-sizeX, -sizeY, -sizeZ)
  v0.applyEuler(rotation).add(xyz).add(positionOffset)
  const v1 = new Vector3(0, -sizeY, -sizeZ)
  v1.applyEuler(rotation).add(xyz).add(positionOffset)
  const v2 = new Vector3(-sizeX, 0, -sizeZ)
  v2.applyEuler(rotation).add(xyz).add(positionOffset)
  const v3 = new Vector3(0, 0, -sizeZ)
  v3.applyEuler(rotation).add(xyz).add(positionOffset)

  const vertices: Polygon = [
    {
      ...{ x: v0.x, y: v0.y, z: v0.z },
      ...{ u: offsetU + 1 / scaleU, v: offsetV },
    },
    {
      ...{ x: v1.x, y: v1.y, z: v1.z },
      ...{ u: offsetU, v: offsetV },
    },
    {
      ...{ x: v2.x, y: v2.y, z: v2.z },
      ...{ u: offsetU + 1 / scaleU, v: offsetV + 1 / scaleV },
    },
    {
      ...{ x: v3.x, y: v3.y, z: v3.z },
      ...{ u: offsetU, v: offsetV + 1 / scaleV },
    },
  ]

  mapData.fts.polygons[mapData.state.polygonGroup] = mapData.fts.polygons[mapData.state.polygonGroup] || []
  mapData.fts.polygons[mapData.state.polygonGroup].push({
    config: {
      color: mapData.state.color,
      isQuad: (textureFlags & POLY_QUAD) > 0,
      bumpable: true,
    },
    vertices,
    tex: useTexture(texture),
    transval: 0,
    area: area,
    type: textureFlags,
    room: 1,
    paddy: 0,
  })
}

const fullBlock = (
  xyz: Vector3,
  rotation: Euler,
  [numberOfWholeTilesW, lastTileWidth]: [number, number],
  [numberOfWholeTilesH, lastTileHeight]: [number, number],
  [w, h]: [number, number],
  [scaleU, scaleV]: [number, number],
  [offsetUPercent, offsetVPercent]: [number, number],
  texture: TextureDefinition | null,
  textureFlags: number,
  area: number,
  mapData: MapData,
) => {
  const [sizeX, sizeY, sizeZ] = [100, 100, 0]

  const positionOffset = new Vector3(-w * 100, -(numberOfWholeTilesH - 1) * 100 + h * 100 - lastTileHeight, 0)
  positionOffset.applyEuler(rotation)

  const offset: [number, number] = [(1 / scaleU) * w - offsetUPercent / 100, (1 / scaleV) * h - offsetVPercent / 100]

  generalBlock(
    [sizeX, sizeY, sizeZ],
    rotation,
    xyz,
    positionOffset,
    offset,
    [scaleU, scaleV],
    texture,
    textureFlags,
    area,
    mapData,
  )
}

const bottomBlock = (
  xyz: Vector3,
  rotation: Euler,
  [numberOfWholeTilesW, lastTileWidth]: [number, number],
  [numberOfWholeTilesH, lastTileHeight]: [number, number],
  [w, h]: [number, number],
  [scaleU, scaleV]: [number, number],
  [offsetUPercent, offsetVPercent]: [number, number],
  texture: TextureDefinition | null,
  textureFlags: number,
  area: number,
  mapData: MapData,
) => {
  const [sizeX, sizeY, sizeZ] = [100, lastTileHeight, 0]

  const positionOffset = new Vector3(-w * 100, 0, 0)
  positionOffset.applyEuler(rotation)

  const offset: [number, number] = [
    (1 / scaleU) * w - offsetUPercent / 100,
    (1 / scaleV) * ((numberOfWholeTilesH * 100) / lastTileHeight) - offsetVPercent / 100,
  ]

  generalBlock(
    [sizeX, sizeY, sizeZ],
    rotation,
    xyz,
    positionOffset,
    offset,
    [scaleU, scaleV],
    texture,
    textureFlags,
    area,
    mapData,
  )
}

const rightBlock = (
  xyz: Vector3,
  rotation: Euler,
  [numberOfWholeTilesW, lastTileWidth]: [number, number],
  [numberOfWholeTilesH, lastTileHeight]: [number, number],
  [w, h]: [number, number],
  [scaleU, scaleV]: [number, number],
  [offsetUPercent, offsetVPercent]: [number, number],
  texture: TextureDefinition | null,
  textureFlags: number,
  area: number,
  mapData: MapData,
) => {
  const [sizeX, sizeY, sizeZ] = [lastTileWidth, 100, 0]

  const positionOffset = new Vector3(
    -(numberOfWholeTilesW * 100),
    -(numberOfWholeTilesH - 1) * 100 + h * 100 - lastTileHeight,
    0,
  )
  positionOffset.applyEuler(rotation)

  const offset: [number, number] = [
    (1 / scaleU) * ((numberOfWholeTilesW * 100) / lastTileWidth) - offsetUPercent / 100,
    (1 / scaleV) * h - offsetVPercent / 100,
  ]

  generalBlock(
    [sizeX, sizeY, sizeZ],
    rotation,
    xyz,
    positionOffset,
    offset,
    [scaleU, scaleV],
    texture,
    textureFlags,
    area,
    mapData,
  )
}

const closingBlock = (
  xyz: Vector3,
  rotation: Euler,
  [numberOfWholeTilesW, lastTileWidth]: [number, number],
  [numberOfWholeTilesH, lastTileHeight]: [number, number],
  [w, h]: [number, number],
  [scaleU, scaleV]: [number, number],
  [offsetUPercent, offsetVPercent]: [number, number],
  texture: TextureDefinition | null,
  textureFlags: number,
  area: number,
  mapData: MapData,
) => {
  const [sizeX, sizeY, sizeZ] = [lastTileWidth, lastTileHeight, 0]

  const positionOffset = new Vector3(-numberOfWholeTilesW * 100, 0, 0)
  positionOffset.applyEuler(rotation)

  const offset: [number, number] = [
    (1 / scaleU) * ((numberOfWholeTilesW * 100) / lastTileWidth) - offsetUPercent / 100,
    (1 / scaleV) * ((numberOfWholeTilesH * 100) / lastTileHeight) - offsetVPercent / 100,
  ]

  generalBlock(
    [sizeX, sizeY, sizeZ],
    rotation,
    xyz,
    positionOffset,
    offset,
    [scaleU, scaleV],
    texture,
    textureFlags,
    area,
    mapData,
  )
}

// [scaleUPercent, scaleVPercent] scales UV in a way, that UV is set to fit horizontally into the surface
// to change that use the uv scaling functions below
export const surface = (
  pos: RelativeCoords,
  [surfaceWidth, surfaceHeight]: [number, number],
  rotation: ArxRotation,
  calculateScaleUV: ([surfaceWidth, surfaceHeight]: [number, number]) => [number, number] = () => [100, 100],
  [offsetUPercent, offsetVPercent]: [number, number] = [0, 0],
) => {
  return (mapData: MapData) => {
    const { texture } = mapData.state
    const textureFlags = texture?.flags ?? POLY_QUAD | POLY_NO_SHADOW

    const xyz = new Vector3(...toAbsoluteCoords(pos, mapData).coords)

    const area = surfaceWidth * surfaceHeight

    const euler = new Euler(
      MathUtils.degToRad(rotation.a),
      MathUtils.degToRad(rotation.b),
      MathUtils.degToRad(rotation.g),
      'XYZ',
    )
    const [numberOfWholeTilesW, lastTileWidth] = evenAndRemainder(100, surfaceWidth)
    const [numberOfWholeTilesH, lastTileHeight] = evenAndRemainder(100, surfaceHeight)

    const [scaleU, scaleV] = calculateScaleUV([surfaceWidth, surfaceHeight])

    if (numberOfWholeTilesH > 0 && numberOfWholeTilesW > 0) {
      for (let h = 0; h < numberOfWholeTilesH; h++) {
        for (let w = 0; w < numberOfWholeTilesW; w++) {
          fullBlock(
            xyz,
            euler,
            [numberOfWholeTilesW, lastTileWidth],
            [numberOfWholeTilesH, lastTileHeight],
            [w, h],
            [scaleU, scaleV],
            [offsetUPercent, offsetVPercent],
            texture,
            textureFlags,
            area,
            mapData,
          )
        }
      }
    }

    if (lastTileHeight > 0) {
      for (let w = 0; w < numberOfWholeTilesW; w++) {
        bottomBlock(
          xyz,
          euler,
          [numberOfWholeTilesW, lastTileWidth],
          [numberOfWholeTilesH, lastTileHeight],
          [w, 1],
          [scaleU, scaleV / (lastTileHeight / 100)],
          [offsetUPercent, offsetVPercent],
          texture,
          textureFlags,
          area,
          mapData,
        )
      }
    }

    if (lastTileWidth > 0) {
      for (let h = 0; h < numberOfWholeTilesH; h++) {
        rightBlock(
          xyz,
          euler,
          [numberOfWholeTilesW, lastTileWidth],
          [numberOfWholeTilesH, lastTileHeight],
          [1, h],
          [scaleU / (lastTileWidth / 100), scaleV],
          [offsetUPercent, offsetVPercent],
          texture,
          textureFlags,
          area,
          mapData,
        )
      }
    }

    if (lastTileWidth > 0 && lastTileHeight > 0) {
      closingBlock(
        xyz,
        euler,
        [numberOfWholeTilesW, lastTileWidth],
        [numberOfWholeTilesH, lastTileHeight],
        [1, 1],
        [scaleU / (lastTileWidth / 100), scaleV / (lastTileHeight / 100)],
        [offsetUPercent, offsetVPercent],
        texture,
        textureFlags,
        area,
        mapData,
      )
    }
  }
}

export const uvFitToWidth =
  () =>
  ([surfaceWidth, surfaceHeight]: [number, number]): [number, number] => {
    return [surfaceWidth / 100, surfaceWidth / 100]
  }

export const uvFitToHeight =
  () =>
  ([surfaceWidth, surfaceHeight]: [number, number]): [number, number] => {
    return [surfaceHeight / 100, surfaceHeight / 100]
  }

// applies a scale to the given UV in percentages, ideal for scaling the results of uv scaling functions
// scaleUV([100, 100], ...) -> no change
// scaleUV([200, 200], ...) -> magnify the textures 2x (half of the texture will be visible)
// scaleUV([50, 50], ...) -> shrinks the textures to 50% (2x more textures will be visible)
// scaleUV(200, ...) -> same as scaleUV([200, 200], ...)
export const scaleUV =
  (scale: number | [number, number]) =>
  ([u, v]: [number, number]): [number, number] => {
    if (Array.isArray(scale)) {
      const [scaleUPercent, scaleVPercent] = scale
      return [(scaleUPercent / 100) * u, (scaleVPercent / 100) * v]
    } else {
      return [(scale / 100) * u, (scale / 100) * v]
    }
  }

export const uvFixPercentage =
  (scale: number | [number, number] = 100) =>
  (): [number, number] => {
    if (Array.isArray(scale)) {
      const [scaleUPercent, scaleVPercent] = scale
      return [scaleUPercent / 100, scaleVPercent / 100]
    } else {
      return [scale / 100, scale / 100]
    }
  }
