import { POLY_QUAD, POLY_NO_SHADOW, HFLIP, VFLIP, TEXTURE_CUSTOM_UV } from '../../constants'
import { useTexture } from '../../assets/textures'
import { flipPolygon, flipUVHorizontally, flipUVVertically, MapData, rotateUV } from '../../helpers'
import { AbsoluteCoords, Polygon, TextureQuad } from '../../types'

const floor =
  (
    position: AbsoluteCoords,
    facing: 'floor' | 'ceiling' = 'floor',
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
    const [x, y, z] = position.coords
    const { texture } = mapData.state
    let u = 0
    let v = 0
    const [sizeX, sizeY, sizeZ] = Array.isArray(size) ? size : [size, size, size]

    let a = { u: 0.5, v: 0 }
    let b = { u: 0.5, v: 0.5 }
    let c = { u: 0, v: 0 }
    let d = { u: 0, v: 0.5 }

    switch (quad) {
      case TEXTURE_CUSTOM_UV:
      case null:
        a = _uv.a
        b = _uv.b
        c = _uv.c
        d = _uv.d
        break
      case 0:
        u = 0
        v = 0
        break
      case 1:
        u = 0.5
        v = 0
        break
      case 2:
        u = 0
        v = 0.5
        break
      case 3:
        u = 0.5
        v = 0.5
        break
    }

    let uv = rotateUV(textureRotation, [0.5, 0.5], [c, d, a, b])

    if (flags & HFLIP) {
      uv = flipUVHorizontally(uv)
    }

    if (flags & VFLIP) {
      uv = flipUVVertically(uv)
    }

    const textureFlags = texture?.flags ?? POLY_QUAD | POLY_NO_SHADOW

    let vertices: Polygon = [
      {
        x: x - sizeX / 2,
        y: y,
        z: z - sizeZ / 2,
        u: u + uv[0].u,
        v: v + uv[0].v,
      },
      {
        x: x + sizeX / 2,
        y: y,
        z: z - sizeZ / 2,
        u: u + uv[1].u,
        v: v + uv[1].v,
      },
      {
        x: x - sizeX / 2,
        y: y,
        z: z + sizeZ / 2,
        u: u + uv[2].u,
        v: v + uv[2].v,
      },
      {
        x: x + sizeX / 2,
        y: y,
        z: z + sizeZ / 2,
        u: u + uv[3].u,
        v: v + uv[3].v,
      },
    ]

    if (facing === 'ceiling') {
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
      area: sizeX * sizeZ,
      type: textureFlags,
      room: 1,
      paddy: 0,
    })

    return mapData
  }

export default floor
