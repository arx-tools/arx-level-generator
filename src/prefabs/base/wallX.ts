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
import { TextureQuad, UV } from '../../types'

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

export default wallX
