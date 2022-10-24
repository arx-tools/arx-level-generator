import { MapData, move, normalizeDegree } from '../../helpers'
import { AbsoluteCoords, Polygon, RelativeCoords, RotationVertex3, UVQuad, Vector3 } from '../../types'
import { POLY_QUAD, POLY_NO_SHADOW } from '../../constants'
import { useTexture } from '../../assets/textures'

const createPolygon = (
  pos: AbsoluteCoords,
  { a, b, g }: RotationVertex3,
  [sizeX, sizeY, sizeZ]: [number, number, number],
  [scaleU, scaleV]: [number, number],
  [offsetU, offsetV]: [number, number],
) => {
  const [x, y, z] = pos.coords

  let vertices: Polygon

  if (b === 0) {
    vertices = [
      {
        ...{ posX: x - sizeX, posY: y - sizeY, posZ: z - sizeZ },
        ...{ texU: offsetU, texV: offsetV },
      },
      {
        ...{ posX: x, posY: y - sizeY, posZ: z - sizeZ },
        ...{ texU: offsetU + 1 / scaleU, texV: offsetV },
      },
      {
        ...{ posX: x - sizeX, posY: y, posZ: z - sizeZ },
        ...{ texU: offsetU, texV: offsetV + 1 / scaleV },
      },
      {
        ...{ posX: x, posY: y, posZ: z - sizeZ },
        ...{ texU: offsetU + 1 / scaleU, texV: offsetV + 1 / scaleV },
      },
    ]
  } else if (b === 90) {
    vertices = [
      {
        ...{ posX: x - sizeX, posY: y - sizeY, posZ: z - sizeZ },
        ...{ texU: offsetU, texV: offsetV },
      },
      {
        ...{ posX: x - sizeX, posY: y, posZ: z - sizeZ },
        ...{ texU: offsetU, texV: offsetV + 1 / scaleV },
      },
      {
        ...{ posX: x - sizeX, posY: y - sizeY, posZ: z },
        ...{ texU: offsetU + 1 / scaleU, texV: offsetV },
      },
      {
        ...{ posX: x - sizeX, posY: y, posZ: z },
        ...{ texU: offsetU + 1 / scaleU, texV: offsetV + 1 / scaleV },
      },
    ]
  } else if (b === 180) {
    vertices = [
      {
        ...{ posX: x - sizeX, posY: y - sizeY, posZ: z - sizeZ },
        ...{ texU: offsetU, texV: offsetV },
      },
      {
        ...{ posX: x - sizeX, posY: y, posZ: z - sizeZ },
        ...{ texU: offsetU, texV: offsetV + 1 / scaleV },
      },
      {
        ...{ posX: x, posY: y - sizeY, posZ: z - sizeZ },
        ...{ texU: offsetU + 1 / scaleU, texV: offsetV },
      },
      {
        ...{ posX: x, posY: y, posZ: z - sizeZ },
        ...{ texU: offsetU + 1 / scaleU, texV: offsetV + 1 / scaleV },
      },
    ]
  } else if (b === 270) {
    vertices = [
      {
        ...{ posX: x - sizeX, posY: y - sizeY, posZ: z - sizeZ },
        ...{ texU: offsetU, texV: offsetV },
      },
      {
        ...{ posX: x - sizeX, posY: y - sizeY, posZ: z },
        ...{ texU: offsetU + 1 / scaleU, texV: offsetV },
      },
      {
        ...{ posX: x - sizeX, posY: y, posZ: z - sizeZ },
        ...{ texU: offsetU, texV: offsetV + 1 / scaleV },
      },
      {
        ...{ posX: x - sizeX, posY: y, posZ: z },
        ...{ texU: offsetU + 1 / scaleU, texV: offsetV + 1 / scaleV },
      },
    ]
  } else {
    // TODO: implement arbitrary rotation
    vertices = [
      { posX: 0, posY: 0, posZ: 0, texU: 0, texV: 0 },
      { posX: 0, posY: 0, posZ: 0, texU: 0, texV: 0 },
      { posX: 0, posY: 0, posZ: 0, texU: 0, texV: 0 },
      { posX: 0, posY: 0, posZ: 0, texU: 0, texV: 0 },
    ]
  }

  return vertices
}

const wall = (
  pos: AbsoluteCoords,
  angle: RotationVertex3,
  size: [number, number, number],
  scale: [number, number],
  offset: [number, number],
) => {
  return (mapData) => {
    const vertices = createPolygon(pos, angle, size, scale, offset)
    const [sizeX, sizeY, sizeZ] = size

    let area: number
    if (angle.b === 0 || angle.b === 180) {
      area = sizeX * sizeY
    } else if (angle.b === 90 || angle.b === 270) {
      area = sizeY * sizeZ
    } else {
      // TODO: calculate size based on arbitrary rotation
      area = 0
    }

    const { texture } = mapData.state

    const textureFlags = texture.flags ?? POLY_QUAD | POLY_NO_SHADOW

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
}

const flipAxis = ([x, y, z]: Vector3): Vector3 => {
  return [z, y, x]
}

// ooooooc
// ooooooc
// ooooooc
// aaaaaax

export const quad = (
  pos: RelativeCoords,
  [surfaceWidth, surfaceHeight]: [number, number],
  rawAngle: number,
  mapData: MapData,
) => {
  const { origin } = mapData.config
  const angle = normalizeDegree(rawAngle)

  const [scaleUPercent, scaleVPercent] = [100, 100]
  const [offsetUPercent, offsetVPercent] = [0, 0]

  const numberOfWholeTilesW = Math.floor(surfaceWidth / 100)
  const lastTileWidth = surfaceWidth % 100

  const numberOfWholeTilesH = Math.floor(surfaceHeight / 100)
  const lastTileHeight = surfaceHeight % 100

  const scaleU = (scaleUPercent / 100) * (surfaceWidth / 100)
  const scaleV = (scaleVPercent / 100) * (surfaceWidth / 100)

  // "o" blocks
  for (let h = 0; h < numberOfWholeTilesH; h++) {
    for (let w = 0; w < numberOfWholeTilesW; w++) {
      const positionOffset: Vector3 = [0, -(numberOfWholeTilesH - 1) * 100 + h * 100 - lastTileHeight, w * 100]
      const size: Vector3 = [0, 100, 100]
      const offset: [number, number] = [
        (1 / scaleU) * w - offsetUPercent / 100,
        (1 / scaleV) * h - offsetVPercent / 100,
      ]
      if (angle === 90 || angle === 270) {
        wall(
          {
            type: 'absolute',
            coords: move(...positionOffset, move(...pos.coords, origin.coords)),
          },
          { a: 0, b: angle, g: 0 },
          size,
          [scaleU, scaleV],
          offset,
        )(mapData)
      } else if (angle === 0 || angle === 180) {
        wall(
          {
            type: 'absolute',
            coords: move(...flipAxis(positionOffset), move(...pos.coords, origin.coords)),
          },
          { a: 0, b: angle, g: 0 },
          flipAxis(size),
          [scaleU, scaleV],
          offset,
        )(mapData)
      } else {
        // TODO: calculate arbitrary rotation
      }
    }
  }

  // "a" blocks
  if (lastTileHeight > 0) {
    const scaleU = (scaleUPercent / 100) * (surfaceWidth / 100)
    const scaleV = ((scaleVPercent / 100) * (surfaceWidth / 100)) / (lastTileHeight / 100)

    for (let w = 0; w < numberOfWholeTilesW; w++) {
      const positionOffset: Vector3 = [0, 0, w * 100]
      const size: Vector3 = [0, lastTileHeight, 100]
      const offset: [number, number] = [
        (1 / scaleU) * w - offsetUPercent / 100,
        (1 / scaleV) * ((numberOfWholeTilesH * 100) / lastTileHeight) - offsetVPercent / 100,
      ]
      if (angle === 90 || angle === 270) {
        wall(
          { type: 'absolute', coords: move(...positionOffset, move(...pos.coords, origin.coords)) },
          { a: 0, b: angle, g: 0 },
          size,
          [scaleU, scaleV],
          offset,
        )(mapData)
      } else if (angle === 0 || angle === 180) {
        wall(
          { type: 'absolute', coords: move(...flipAxis(positionOffset), move(...pos.coords, origin.coords)) },
          { a: 0, b: angle, g: 0 },
          flipAxis(size),
          [scaleU, scaleV],
          offset,
        )(mapData)
      } else {
        // TODO: calculate arbitrary rotation
      }
    }
  }

  // "c" blocks
  if (lastTileWidth > 0) {
    const scaleU = ((scaleUPercent / 100) * (surfaceWidth / 100)) / (lastTileWidth / 100)
    const scaleV = (scaleVPercent / 100) * (surfaceWidth / 100)

    for (let h = 0; h < numberOfWholeTilesH; h++) {
      const positionOffset: Vector3 = [
        0,
        -(numberOfWholeTilesH - 1) * 100 + h * 100 - lastTileHeight,
        (numberOfWholeTilesW - 1) * 100 + lastTileWidth,
      ]
      const size: Vector3 = [0, 100, lastTileWidth]
      const offset: [number, number] = [
        (1 / scaleU) * ((numberOfWholeTilesW * 100) / lastTileWidth) - offsetUPercent / 100,
        (1 / scaleV) * h - offsetVPercent / 100,
      ]
      if (angle === 90 || angle === 270) {
        wall(
          {
            type: 'absolute',
            coords: move(...positionOffset, move(...pos.coords, origin.coords)),
          },
          { a: 0, b: angle, g: 0 },
          size,
          [scaleU, scaleV],
          offset,
        )(mapData)
      } else if (angle === 0 || angle === 180) {
        wall(
          {
            type: 'absolute',
            coords: move(...flipAxis(positionOffset), move(...pos.coords, origin.coords)),
          },
          { a: 0, b: angle, g: 0 },
          flipAxis(size),
          [scaleU, scaleV],
          offset,
        )(mapData)
      } else {
        // TODO: calculate arbitrary rotation
      }
    }
  }

  // "x" block
  if (lastTileWidth > 0 && lastTileHeight > 0) {
    const scaleU = ((scaleUPercent / 100) * (surfaceWidth / 100)) / (lastTileWidth / 100)
    const scaleV = ((scaleVPercent / 100) * (surfaceWidth / 100)) / (lastTileHeight / 100)

    const positionOffset: Vector3 = [0, 0, lastTileWidth + (numberOfWholeTilesW - 1) * 100]
    const size: Vector3 = [0, lastTileHeight, lastTileWidth]
    const offset: [number, number] = [
      (1 / scaleU) * ((numberOfWholeTilesW * 100) / lastTileWidth) - offsetUPercent / 100,
      (1 / scaleV) * ((numberOfWholeTilesH * 100) / lastTileHeight) - offsetVPercent / 100,
    ]

    if (angle === 90 || angle === 270) {
      wall(
        {
          type: 'absolute',
          coords: move(...positionOffset, move(...pos.coords, origin.coords)),
        },
        { a: 0, b: angle, g: 0 },
        size,
        [scaleU, scaleV],
        offset,
      )(mapData)
    } else if (angle === 0 || angle === 180) {
      wall(
        {
          type: 'absolute',
          coords: move(...flipAxis(positionOffset), move(...pos.coords, origin.coords)),
        },
        { a: 0, b: angle, g: 0 },
        flipAxis(size),
        [scaleU, scaleV],
        offset,
      )(mapData)
    } else {
      // TODO: calculate arbitrary rotation
    }
  }
}
