import { MapData, move } from '../../helpers'
import { RelativeCoords, TextureQuad, UV } from '../../types'
import {
  POLY_QUAD,
  POLY_NO_SHADOW,
  HFLIP,
  VFLIP,
  TEXTURE_QUAD_TOP_LEFT,
  TEXTURE_QUAD_TOP_RIGHT,
  TEXTURE_QUAD_BOTTOM_RIGHT,
  TEXTURE_QUAD_BOTTOM_LEFT,
  TEXTURE_FULL_SCALE,
  TEXTURE_CUSTOM_UV,
  TEXTURE_CUSTOM_SCALE,
} from '../../constants'
import { useTexture } from '../../assets/textures'
import { flipPolygon, flipUVHorizontally, flipUVVertically, rotateUV } from '../../helpers'

// [x, y, z] are absolute coordinates,
// not relative to origin
const wallX =
  (
    [x, y, z],
    facing: 'left' | 'right' = 'left',
    quad: TextureQuad = TEXTURE_FULL_SCALE,
    textureRotation = 0,
    size: number | [number, number, number] = 100,
    flags = 0,
    _uv: { a: UV; b: UV; c: UV; d: UV } | null = null,
    scaleU: number = 1,
    scaleV: number = 1,
    offsetU: number = 0,
    offsetV: number = 0,
    rotateCenterU: number = 0.5,
    rotateCenterV: number = 0.5,
  ) =>
  (mapData) => {
    const { texture } = mapData.state

    const [sizeX, sizeY, sizeZ] = Array.isArray(size) ? size : [size, size, size]

    let a = { u: 1, v: 0 }
    let b = { u: 1, v: 1 }
    let c = { u: 0, v: 0 }
    let d = { u: 0, v: 1 }

    if (quad === TEXTURE_CUSTOM_UV) {
      if (_uv !== null) {
        ;({ a, b, c, d } = _uv)
      }
    } else if (quad === TEXTURE_CUSTOM_SCALE) {
      a = { u: offsetU + 1 / scaleU, v: offsetV }
      b = { u: offsetU + 1 / scaleU, v: offsetV + 1 / scaleV }
      c = { u: offsetU, v: offsetV }
      d = { u: offsetU, v: offsetV + 1 / scaleV }
    } else {
      let scale = 1
      let offsetU = 0
      let offsetV = 0

      switch (quad) {
        case TEXTURE_QUAD_TOP_LEFT:
          scale = 2
          offsetU = 0
          offsetV = 0
          break
        case TEXTURE_QUAD_TOP_RIGHT:
          scale = 2
          offsetU = 1 / scale
          offsetV = 0
          break
        case TEXTURE_QUAD_BOTTOM_RIGHT:
          scale = 2
          offsetU = 1 / scale
          offsetV = 1 / scale
          break
        case TEXTURE_QUAD_BOTTOM_LEFT:
          scale = 2
          offsetU = 0
          offsetV = 1 / scale
          break
      }

      a = { u: offsetU + 1 / scale, v: offsetV }
      b = { u: offsetU + 1 / scale, v: offsetV + 1 / scale }
      c = { u: offsetU, v: offsetV }
      d = { u: offsetU, v: offsetV + 1 / scale }
    }

    let uv = rotateUV(textureRotation, [rotateCenterU, rotateCenterV], [c, d, a, b])

    if (flags & HFLIP) {
      uv = flipUVHorizontally(uv)
    }

    if (flags & VFLIP) {
      uv = flipUVVertically(uv)
    }

    const textureFlags = texture.flags ?? POLY_QUAD | POLY_NO_SHADOW

    let vertices = [
      {
        posX: x - sizeX / 2,
        posY: y - sizeY / 2,
        posZ: z - sizeZ / 2,
        texU: uv[0].u,
        texV: uv[0].v,
      },
      {
        posX: x - sizeX / 2,
        posY: y + sizeY / 2,
        posZ: z - sizeZ / 2,
        texU: uv[1].u,
        texV: uv[1].v,
      },
      {
        posX: x - sizeX / 2,
        posY: y - sizeY / 2,
        posZ: z + sizeZ / 2,
        texU: uv[2].u,
        texV: uv[2].v,
      },
      {
        posX: x - sizeX / 2,
        posY: y + sizeY / 2,
        posZ: z + sizeZ / 2,
        texU: uv[3].u,
        texV: uv[3].v,
      },
    ]

    if (facing === 'left') {
      vertices = flipPolygon(vertices)
    }

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

// -------------------

export const quadX = (pos: RelativeCoords, size: [number, number], mapData: MapData) => {
  const { origin } = mapData.config

  const rotation = 0

  const [surfaceWidth, surfaceHeight] = size
  const [scaleUPercent, scaleVPercent] = [100, 100]
  const [offsetUPercent, offsetVPercent] = [0, 0]

  const numberOfWholeTilesX = Math.floor(surfaceWidth / 100)
  const lastTileWidth = surfaceWidth % 100

  const numberOfWholeTilesY = Math.floor(surfaceHeight / 100)
  const lastTileHeight = surfaceHeight % 100

  let rotateCenterX: number
  let rotateCenterY: number
  let scaleU: number
  let scaleV: number

  scaleU = (scaleUPercent / 100) * (surfaceWidth / 100)
  scaleV = (scaleVPercent / 100) * (surfaceWidth / 100)

  for (let y = 0; y < numberOfWholeTilesY; y++) {
    for (let x = 0; x < numberOfWholeTilesX; x++) {
      // TODO: calculate the rotation origin
      rotateCenterX = 0.5
      rotateCenterY = 0.5

      wallX(
        move(
          0,
          -(numberOfWholeTilesY - 1) * 100 + y * 100 - lastTileHeight - 50,
          50 + x * 100,
          move(...pos.coords, origin.coords),
        ),
        'right',
        TEXTURE_CUSTOM_SCALE,
        rotation,
        [0, 100, 100],
        0,
        null,
        scaleU,
        scaleV,
        (1 / scaleU) * x - offsetUPercent / 100,
        (1 / scaleV) * y - offsetVPercent / 100,
        rotateCenterX,
        rotateCenterY,
      )(mapData)
    }
  }

  if (lastTileHeight > 0) {
    // TODO: calculate the rotation origin
    rotateCenterX = 0.5
    rotateCenterY = 0.5
    scaleU = (scaleUPercent / 100) * (surfaceWidth / 100)
    scaleV = ((scaleVPercent / 100) * (surfaceWidth / 100)) / (lastTileHeight / 100)

    for (let x = 0; x < numberOfWholeTilesX; x++) {
      wallX(
        move(0, -lastTileHeight / 2, 50 + x * 100, move(...pos.coords, origin.coords)),
        'right',
        TEXTURE_CUSTOM_SCALE,
        rotation,
        [0, lastTileHeight, 100],
        0,
        null,
        scaleU,
        scaleV,
        (1 / scaleU) * x - offsetUPercent / 100,
        (1 / scaleV) * ((numberOfWholeTilesY * 100) / lastTileHeight) - offsetVPercent / 100,
        rotateCenterX,
        rotateCenterY,
      )(mapData)
    }
  }

  if (lastTileWidth > 0) {
    // TODO: calculate the rotation origin
    rotateCenterX = 0.5
    rotateCenterY = 0.5
    scaleU = ((scaleUPercent / 100) * (surfaceWidth / 100)) / (lastTileWidth / 100)
    scaleV = (scaleVPercent / 100) * (surfaceWidth / 100)

    for (let y = 0; y < numberOfWholeTilesY; y++) {
      wallX(
        move(
          0,
          -(numberOfWholeTilesY - 1) * 100 + y * 100 - lastTileHeight - 50,
          lastTileWidth / 2 + numberOfWholeTilesX * 100,
          move(...pos.coords, origin.coords),
        ),
        'right',
        TEXTURE_CUSTOM_SCALE,
        rotation,
        [0, 100, lastTileWidth],
        0,
        null,
        scaleU,
        scaleV,
        (1 / scaleU) * ((numberOfWholeTilesX * 100) / lastTileWidth) - offsetUPercent / 100,
        (1 / scaleV) * y - offsetVPercent / 100,
        rotateCenterX,
        rotateCenterY,
      )(mapData)
    }
  }

  if (lastTileWidth > 0 && lastTileHeight > 0) {
    // TODO: calculate the rotation origin
    rotateCenterX = 0.5
    rotateCenterY = 0.5
    scaleU = ((scaleUPercent / 100) * (surfaceWidth / 100)) / (lastTileWidth / 100)
    scaleV = ((scaleVPercent / 100) * (surfaceWidth / 100)) / (lastTileHeight / 100)

    wallX(
      move(0, -lastTileHeight / 2, lastTileWidth / 2 + numberOfWholeTilesX * 100, move(...pos.coords, origin.coords)),
      'right',
      TEXTURE_CUSTOM_SCALE,
      rotation,
      [0, lastTileHeight, lastTileWidth],
      0,
      null,
      scaleU,
      scaleV,
      (1 / scaleU) * ((numberOfWholeTilesX * 100) / lastTileWidth) - offsetUPercent / 100,
      (1 / scaleV) * ((numberOfWholeTilesY * 100) / lastTileHeight) - offsetVPercent / 100,
      rotateCenterX,
      rotateCenterY,
    )(mapData)
  }
}
