import { MapData, move, normalizeDegree } from '../../helpers'
import { AbsoluteCoords, RelativeCoords, UVQuad, Vector3 } from '../../types'
import { POLY_QUAD, POLY_NO_SHADOW } from '../../constants'
import { useTexture } from '../../assets/textures'
import { flipPolygon } from '../../helpers'

// quasii wallX
const wallOnTheZAxis = (
  pos: AbsoluteCoords,
  facing: string,
  [sizeX, sizeY, sizeZ]: [number, number, number],
  [scaleU, scaleV]: [number, number],
  [offsetU, offsetV]: [number, number],
) => {
  return (mapData) => {
    const { texture } = mapData.state
    const [x, y, z] = pos.coords

    const uv: UVQuad = [
      { u: offsetU, v: offsetV },
      { u: offsetU, v: offsetV + 1 / scaleV },
      { u: offsetU + 1 / scaleU, v: offsetV },
      { u: offsetU + 1 / scaleU, v: offsetV + 1 / scaleV },
    ]

    let vertices = [
      {
        posX: x - sizeX,
        posY: y - sizeY,
        posZ: z - sizeZ,
        texU: uv[0].u,
        texV: uv[0].v,
      },
      {
        posX: x - sizeX,
        posY: y,
        posZ: z - sizeZ,
        texU: uv[1].u,
        texV: uv[1].v,
      },
      {
        posX: x - sizeX,
        posY: y - sizeY,
        posZ: z,
        texU: uv[2].u,
        texV: uv[2].v,
      },
      {
        posX: x - sizeX,
        posY: y,
        posZ: z,
        texU: uv[3].u,
        texV: uv[3].v,
      },
    ]

    if (facing === 'left') {
      vertices = flipPolygon(vertices)
    }

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
      area: sizeX * sizeY,
      type: textureFlags,
      room: 1,
      paddy: 0,
    })
  }
}

// quasii wallZ
const wallOnTheXAxis = (
  pos: AbsoluteCoords,
  facing: string,
  [sizeX, sizeY, sizeZ]: [number, number, number],
  [scaleU, scaleV]: [number, number],
  [offsetU, offsetV]: [number, number],
) => {
  return (mapData) => {
    const { texture } = mapData.state
    const [x, y, z] = pos.coords

    const uv: UVQuad = [
      { u: offsetU, v: offsetV },
      { u: offsetU, v: offsetV + 1 / scaleV },
      { u: offsetU + 1 / scaleU, v: offsetV },
      { u: offsetU + 1 / scaleU, v: offsetV + 1 / scaleV },
    ]

    let vertices = [
      {
        posX: x - sizeX,
        posY: y - sizeY,
        posZ: z - sizeZ,
        texU: uv[0].u,
        texV: uv[0].v,
      },
      {
        posX: x - sizeX,
        posY: y,
        posZ: z - sizeZ,
        texU: uv[1].u,
        texV: uv[1].v,
      },
      {
        posX: x,
        posY: y - sizeY,
        posZ: z - sizeZ,
        texU: uv[2].u,
        texV: uv[2].v,
      },
      {
        posX: x,
        posY: y,
        posZ: z - sizeZ,
        texU: uv[3].u,
        texV: uv[3].v,
      },
    ]

    if (facing === 'front') {
      vertices = flipPolygon(vertices)
    }

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
      area: sizeX * sizeY,
      type: textureFlags,
      room: 1,
      paddy: 0,
    })
  }
}

const flipAxis = ([x, y, z]: Vector3): Vector3 => {
  return [z, y, x]
}

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

  for (let h = 0; h < numberOfWholeTilesH; h++) {
    for (let w = 0; w < numberOfWholeTilesW; w++) {
      const positionOffset: Vector3 = [0, -(numberOfWholeTilesH - 1) * 100 + h * 100 - lastTileHeight, w * 100]
      const size: Vector3 = [0, 100, 100]
      if (angle === 90 || angle === 270) {
        wallOnTheZAxis(
          {
            type: 'absolute',
            coords: move(...positionOffset, move(...pos.coords, origin.coords)),
          },
          angle === 90 ? 'right' : 'left',
          size,
          [scaleU, scaleV],
          [(1 / scaleU) * w - offsetUPercent / 100, (1 / scaleV) * h - offsetVPercent / 100],
        )(mapData)
      } else if (angle === 0 || angle === 180) {
        wallOnTheXAxis(
          {
            type: 'absolute',
            coords: move(...flipAxis(positionOffset), move(...pos.coords, origin.coords)),
          },
          angle === 0 ? 'front' : 'back',
          flipAxis(size),
          [scaleU, scaleV],
          [(1 / scaleU) * w - offsetUPercent / 100, (1 / scaleV) * h - offsetVPercent / 100],
        )(mapData)
      } else {
        // TODO: calculate arbitrary rotation
      }
    }
  }

  if (lastTileHeight > 0) {
    const scaleU = (scaleUPercent / 100) * (surfaceWidth / 100)
    const scaleV = ((scaleVPercent / 100) * (surfaceWidth / 100)) / (lastTileHeight / 100)

    for (let w = 0; w < numberOfWholeTilesW; w++) {
      const positionOffset: Vector3 = [0, 0, w * 100]
      const size: Vector3 = [0, lastTileHeight, 100]
      if (angle === 90 || angle === 270) {
        wallOnTheZAxis(
          { type: 'absolute', coords: move(...positionOffset, move(...pos.coords, origin.coords)) },
          angle === 90 ? 'right' : 'left',
          size,
          [scaleU, scaleV],
          [
            (1 / scaleU) * w - offsetUPercent / 100,
            (1 / scaleV) * ((numberOfWholeTilesH * 100) / lastTileHeight) - offsetVPercent / 100,
          ],
        )(mapData)
      } else if (angle === 0 || angle === 180) {
        wallOnTheXAxis(
          { type: 'absolute', coords: move(...flipAxis(positionOffset), move(...pos.coords, origin.coords)) },
          angle === 0 ? 'front' : 'back',
          flipAxis(size),
          [scaleU, scaleV],
          [
            (1 / scaleU) * w - offsetUPercent / 100,
            (1 / scaleV) * ((numberOfWholeTilesH * 100) / lastTileHeight) - offsetVPercent / 100,
          ],
        )(mapData)
      } else {
        // TODO: calculate arbitrary rotation
      }
    }
  }

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
      if (angle === 90 || angle === 270) {
        wallOnTheZAxis(
          {
            type: 'absolute',
            coords: move(...positionOffset, move(...pos.coords, origin.coords)),
          },
          angle === 90 ? 'right' : 'left',
          size,
          [scaleU, scaleV],
          [
            (1 / scaleU) * ((numberOfWholeTilesW * 100) / lastTileWidth) - offsetUPercent / 100,
            (1 / scaleV) * h - offsetVPercent / 100,
          ],
        )(mapData)
      } else if (angle === 0 || angle === 180) {
        wallOnTheXAxis(
          {
            type: 'absolute',
            coords: move(...flipAxis(positionOffset), move(...pos.coords, origin.coords)),
          },
          angle === 0 ? 'front' : 'back',
          flipAxis(size),
          [scaleU, scaleV],
          [
            (1 / scaleU) * ((numberOfWholeTilesW * 100) / lastTileWidth) - offsetUPercent / 100,
            (1 / scaleV) * h - offsetVPercent / 100,
          ],
        )(mapData)
      } else {
        // TODO: calculate arbitrary rotation
      }
    }
  }

  if (lastTileWidth > 0 && lastTileHeight > 0) {
    const scaleU = ((scaleUPercent / 100) * (surfaceWidth / 100)) / (lastTileWidth / 100)
    const scaleV = ((scaleVPercent / 100) * (surfaceWidth / 100)) / (lastTileHeight / 100)

    const positionOffset: Vector3 = [0, 0, lastTileWidth + (numberOfWholeTilesW - 1) * 100]
    const size: Vector3 = [0, lastTileHeight, lastTileWidth]

    if (angle === 90 || angle === 270) {
      wallOnTheZAxis(
        {
          type: 'absolute',
          coords: move(...positionOffset, move(...pos.coords, origin.coords)),
        },
        angle === 90 ? 'right' : 'left',
        size,
        [scaleU, scaleV],
        [
          (1 / scaleU) * ((numberOfWholeTilesW * 100) / lastTileWidth) - offsetUPercent / 100,
          (1 / scaleV) * ((numberOfWholeTilesH * 100) / lastTileHeight) - offsetVPercent / 100,
        ],
      )(mapData)
    } else if (angle === 0 || angle === 180) {
      wallOnTheXAxis(
        {
          type: 'absolute',
          coords: move(...flipAxis(positionOffset), move(...pos.coords, origin.coords)),
        },
        angle === 0 ? 'front' : 'back',
        flipAxis(size),
        [scaleU, scaleV],
        [
          (1 / scaleU) * ((numberOfWholeTilesW * 100) / lastTileWidth) - offsetUPercent / 100,
          (1 / scaleV) * ((numberOfWholeTilesH * 100) / lastTileHeight) - offsetVPercent / 100,
        ],
      )(mapData)
    } else {
      // TODO: calculate arbitrary rotation
    }
  }
}
