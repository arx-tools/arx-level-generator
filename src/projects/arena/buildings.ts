import { MapData, move } from '../../helpers'
import { AbsoluteCoords, RelativeCoords, TextureQuad, UV, UVQuad } from '../../types'
import { POLY_QUAD, POLY_NO_SHADOW } from '../../constants'
import { useTexture } from '../../assets/textures'
import { flipPolygon } from '../../helpers'

const wallX = (
  pos: AbsoluteCoords,
  facing: 'left' | 'right' = 'left',
  [sizeX, sizeY, sizeZ]: [number, number, number],
  scaleU: number = 1,
  scaleV: number = 1,
  offsetU: number = 0,
  offsetV: number = 0,
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

export const quadX = (pos: RelativeCoords, [surfaceWidth, surfaceHeight]: [number, number], mapData: MapData) => {
  const { origin } = mapData.config

  const [scaleUPercent, scaleVPercent] = [100, 100]
  const [offsetUPercent, offsetVPercent] = [0, 0]

  const numberOfWholeTilesX = Math.floor(surfaceWidth / 100)
  const lastTileWidth = surfaceWidth % 100

  const numberOfWholeTilesY = Math.floor(surfaceHeight / 100)
  const lastTileHeight = surfaceHeight % 100

  const scaleU = (scaleUPercent / 100) * (surfaceWidth / 100)
  const scaleV = (scaleVPercent / 100) * (surfaceWidth / 100)

  for (let y = 0; y < numberOfWholeTilesY; y++) {
    for (let x = 0; x < numberOfWholeTilesX; x++) {
      wallX(
        {
          type: 'absolute',
          coords: move(
            0,
            -(numberOfWholeTilesY - 1) * 100 + y * 100 - lastTileHeight,
            x * 100,
            move(...pos.coords, origin.coords),
          ),
        },
        'right',
        [0, 100, 100],
        scaleU,
        scaleV,
        (1 / scaleU) * x - offsetUPercent / 100,
        (1 / scaleV) * y - offsetVPercent / 100,
      )(mapData)
    }
  }

  if (lastTileHeight > 0) {
    const scaleU = (scaleUPercent / 100) * (surfaceWidth / 100)
    const scaleV = ((scaleVPercent / 100) * (surfaceWidth / 100)) / (lastTileHeight / 100)

    for (let x = 0; x < numberOfWholeTilesX; x++) {
      wallX(
        { type: 'absolute', coords: move(0, 0, x * 100, move(...pos.coords, origin.coords)) },
        'right',
        [0, lastTileHeight, 100],
        scaleU,
        scaleV,
        (1 / scaleU) * x - offsetUPercent / 100,
        (1 / scaleV) * ((numberOfWholeTilesY * 100) / lastTileHeight) - offsetVPercent / 100,
      )(mapData)
    }
  }

  if (lastTileWidth > 0) {
    const scaleU = ((scaleUPercent / 100) * (surfaceWidth / 100)) / (lastTileWidth / 100)
    const scaleV = (scaleVPercent / 100) * (surfaceWidth / 100)

    for (let y = 0; y < numberOfWholeTilesY; y++) {
      wallX(
        {
          type: 'absolute',
          coords: move(
            0,
            -(numberOfWholeTilesY - 1) * 100 + y * 100 - lastTileHeight,
            (numberOfWholeTilesX - 1) * 100 + lastTileWidth,
            move(...pos.coords, origin.coords),
          ),
        },
        'right',
        [0, 100, lastTileWidth],
        scaleU,
        scaleV,
        (1 / scaleU) * ((numberOfWholeTilesX * 100) / lastTileWidth) - offsetUPercent / 100,
        (1 / scaleV) * y - offsetVPercent / 100,
      )(mapData)
    }
  }

  if (lastTileWidth > 0 && lastTileHeight > 0) {
    const scaleU = ((scaleUPercent / 100) * (surfaceWidth / 100)) / (lastTileWidth / 100)
    const scaleV = ((scaleVPercent / 100) * (surfaceWidth / 100)) / (lastTileHeight / 100)

    wallX(
      {
        type: 'absolute',
        coords: move(0, 0, lastTileWidth + (numberOfWholeTilesX - 1) * 100, move(...pos.coords, origin.coords)),
      },
      'right',
      [0, lastTileHeight, lastTileWidth],
      scaleU,
      scaleV,
      (1 / scaleU) * ((numberOfWholeTilesX * 100) / lastTileWidth) - offsetUPercent / 100,
      (1 / scaleV) * ((numberOfWholeTilesY * 100) / lastTileHeight) - offsetVPercent / 100,
    )(mapData)
  }
}
