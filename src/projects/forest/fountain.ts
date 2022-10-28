import path from 'path'
import { loadObj } from '../../assets/models'
import { textures, useTexture } from '../../assets/textures'
import { POLY_NO_SHADOW, POLY_QUAD } from '../../constants'
import { MapData, setTexture } from '../../helpers'
import { RelativeCoords } from '../../types'

// source: https://www.turbosquid.com/de/3d-models/free-fountain-3d-model/615012
export const createFountain = async (pos: RelativeCoords, scale: number, mapData: MapData) => {
  setTexture(textures.wood.aliciaRoomMur02, mapData)

  const polygons = await loadObj(path.resolve('./assets/projects/forest/models/fountain/fountain.obj'))

  const { texture } = mapData.state
  const textureFlags = texture?.flags ?? POLY_QUAD | POLY_NO_SHADOW

  mapData.fts.polygons[mapData.state.polygonGroup] = mapData.fts.polygons[mapData.state.polygonGroup] || []

  polygons.forEach((vertices) => {
    vertices = vertices.map((vertex, i) => {
      vertex.posX = vertex.posX * scale + mapData.config.origin.coords[0] + pos.coords[0]
      vertex.posY = vertex.posY * -1 * scale + mapData.config.origin.coords[1] + pos.coords[1]
      vertex.posZ = vertex.posZ * scale + mapData.config.origin.coords[2] + pos.coords[2]
      return vertex
    })

    let flags = textureFlags
    if (vertices.length === 3) {
      flags = flags & ~POLY_QUAD
      vertices.push({ posX: 0, posY: 0, posZ: 0, texU: 0, texV: 0 })
    }

    mapData.fts.polygons[mapData.state.polygonGroup].push({
      config: {
        color: mapData.state.color,
        isQuad: (flags & POLY_QUAD) > 0,
        bumpable: true,
      },
      vertices,
      tex: useTexture(texture),
      transval: 0,
      area: 1000,
      type: flags,
      room: 1,
      paddy: 0,
    })
  })
}
