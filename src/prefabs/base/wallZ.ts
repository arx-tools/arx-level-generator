import { POLY_QUAD, POLY_NO_SHADOW, HFLIP, VFLIP, TEXTURE_CUSTOM_UV } from '../../constants'
import { TextureDefinition, useTexture } from '../../assets/textures'
import { flipPolygon, flipUVHorizontally, flipUVVertically, MapData, rotateUV } from '../../helpers'
import { Polygon, TextureQuad, Vector3 } from '../../types'

// [x, y, z] are absolute coordinates,
// not relative to origin
const wallZ =
  (
    [x, y, z]: Vector3,
    facing: 'front' | 'back' = 'front',
    quad: TextureQuad = 0,
    textureRotation = 0,
    size: number | [number, number, number] = 100,
    flags = 0,
    _uv = {
      a: { u: 1, v: 0 },
      b: { u: 1, v: 1 },
      c: { u: 0, v: 0 },
      d: { u: 0, v: 1 },
    },
  ) =>
  (mapData: MapData) => {
    const texture = mapData.state.texture as TextureDefinition
    let texU = 0
    let texV = 0

    const [sizeX, sizeY, sizeZ] = Array.isArray(size) ? size : [size, size, size]

    let a = { u: 0.5, v: 0 }
    let b = { u: 0.5, v: 0.5 }
    let c = { u: 0, v: 0 }
    let d = { u: 0, v: 0.5 }

    if (quad === null || quad === TEXTURE_CUSTOM_UV) {
      a = _uv.a
      b = _uv.b
      c = _uv.c
      d = _uv.d
    } else {
      switch (quad) {
        case 0:
          texU = 0
          texV = 0
          break
        case 1:
          texU = 0.5
          texV = 0
          break
        case 2:
          texU = 0.5
          texV = 0.5
          break
        case 3:
          texU = 0
          texV = 0.5
          break
      }
    }

    let uv = rotateUV(textureRotation, [0.5, 0.5], [c, d, a, b])

    if (flags & HFLIP) {
      uv = flipUVHorizontally(uv)
    }

    if (flags & VFLIP) {
      uv = flipUVVertically(uv)
    }

    const textureFlags = texture.flags ?? POLY_QUAD | POLY_NO_SHADOW

    let vertices: Polygon = [
      {
        posX: x - sizeX / 2,
        posY: y - sizeY / 2,
        posZ: z - sizeZ / 2,
        texU: texU + uv[0].u,
        texV: texV + uv[0].v,
      },
      {
        posX: x - sizeX / 2,
        posY: y + sizeY / 2,
        posZ: z - sizeZ / 2,
        texU: texU + uv[1].u,
        texV: texV + uv[1].v,
      },
      {
        posX: x + sizeX / 2,
        posY: y - sizeY / 2,
        posZ: z - sizeZ / 2,
        texU: texU + uv[2].u,
        texV: texV + uv[2].v,
      },
      {
        posX: x + sizeX / 2,
        posY: y + sizeY / 2,
        posZ: z - sizeZ / 2,
        texU: texU + uv[3].u,
        texV: texV + uv[3].v,
      },
    ]

    if (facing === 'front') {
      vertices = flipPolygon(vertices)
    }

    mapData.fts.polygons[mapData.state.polygonGroup] = mapData.fts.polygons[mapData.state.polygonGroup] ?? []

    mapData.fts.polygons[mapData.state.polygonGroup].push({
      config: {
        color: mapData.state.color,
        isQuad: (textureFlags & POLY_QUAD) > 0,
        bumpable: true,
      },
      vertices,
      tex: useTexture(texture),
      transval: 0,
      area: sizeY * sizeZ,
      type: textureFlags,
      room: 1,
      paddy: 0,
    })
  }

export default wallZ
