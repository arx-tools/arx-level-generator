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
    size = 100,
    flags = 0,
    _uv: { a: UV; b: UV; c: UV; d: UV } = {
      a: { u: 1, v: 0 },
      b: { u: 1, v: 1 },
      c: { u: 0, v: 0 },
      d: { u: 0, v: 1 },
    },
  ) =>
  (mapData) => {
    const { texture } = mapData.state

    const [sizeX, sizeY, sizeZ] = Array.isArray(size) ? size : [size, size, size]

    let a
    let b
    let c
    let d

    switch (quad) {
      case TEXTURE_FULL_SCALE:
        a = { u: 1, v: 0 }
        b = { u: 1, v: 1 }
        c = { u: 0, v: 0 }
        d = { u: 0, v: 1 }
        break
      case TEXTURE_QUAD_TOP_LEFT:
        {
          const scale = 0.5
          a = { u: 1 * scale, v: 0 }
          b = { u: 1 * scale, v: 1 * scale }
          c = { u: 0, v: 0 }
          d = { u: 0, v: 1 * scale }
        }
        break
      case TEXTURE_QUAD_TOP_RIGHT:
        {
          a = { u: 1, v: 0 }
          b = { u: 1, v: 0.5 }
          c = { u: 0.5, v: 0 }
          d = { u: 0.5, v: 0.5 }
        }
        break
      case TEXTURE_QUAD_BOTTOM_RIGHT:
        {
          a = { u: 1, v: 0.5 }
          b = { u: 1, v: 1 }
          c = { u: 0.5, v: 0.5 }
          d = { u: 0.5, v: 1 }
        }
        break
      case TEXTURE_QUAD_BOTTOM_LEFT:
        {
          a = { u: 0.5, v: 0.5 }
          b = { u: 0.5, v: 1 }
          c = { u: 0, v: 0.5 }
          d = { u: 0, v: 1 }
        }
        break
      case TEXTURE_CUSTOM_SCALE:
        ;({ a, b, c, d } = _uv)
        break
    }

    let uv = rotateUV(textureRotation, [c, d, a, b])

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
