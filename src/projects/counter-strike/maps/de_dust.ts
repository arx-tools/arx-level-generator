import path from 'path'
import {
  flipPolygonAxis,
  willThePolygonDataFit,
  loadObj,
  renderPolygonData,
  turnPolygonDataInsideOut,
  flipTextureUpsideDown,
} from '../../../assets/models'
import { textures } from '../../../assets/textures'
import { POLY_GLOW, POLY_NO_SHADOW } from '../../../constants'
import { MapData, setTexture } from '../../../helpers'
import { RelativeCoords } from '../../../types'

// source: https://sketchfab.com/3d-models/de-dust-b34e959814ae40549142bca18f4a4caf
export const createDeDust = async (pos: RelativeCoords, scale: number, mapData: MapData) => {
  let polygons = await loadObj(path.resolve('./assets/projects/counter-strike/models/de_dust/de_dust.obj'))

  flipPolygonAxis('xy', polygons)
  turnPolygonDataInsideOut(polygons)
  flipTextureUpsideDown(polygons)

  willThePolygonDataFit('de_dust.obj', polygons, pos, scale, mapData)

  renderPolygonData(polygons, pos, scale, ({ polygon, texture, isQuad }) => {
    const textureIdx = parseInt(texture.split('_')[1])

    let flags = POLY_NO_SHADOW

    if (textureIdx === 19) {
      flags |= POLY_GLOW
    }

    if (textureIdx === 19) {
      // no texture for material 19
      setTexture(
        {
          ...textures.wood.aliciaRoomMur02,
          flags,
        },
        mapData,
      )
    } else {
      setTexture(
        {
          path: 'projects/counter-strike/models/de_dust/textures',
          src: `de_dust_texture_${textureIdx}.jpg`,
          native: false,
          flags,
        },
        mapData,
      )
    }
  })(mapData)
}
