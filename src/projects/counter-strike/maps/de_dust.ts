import path from 'path'
import {
  flipPolygonAxis,
  willThePolygonDataFit,
  loadObj,
  renderPolygonData,
  rotatePolygonData,
} from '../../../assets/models'
import { textures } from '../../../assets/textures'
import { MapData, setTexture } from '../../../helpers'
import { RelativeCoords } from '../../../types'

// source: https://sketchfab.com/3d-models/de-dust-b34e959814ae40549142bca18f4a4caf
export const createDeDust = async (pos: RelativeCoords, scale: number, mapData: MapData) => {
  let polygons = await loadObj(path.resolve('./assets/projects/counter-strike/models/de_dust/de_dust.obj'))

  flipPolygonAxis('xy', polygons)
  // rotatePolygonData({ a: 0, b: 180, g: 0 }, polygons)

  polygons.forEach(({ polygon }, i) => {
    polygons[i].polygon = polygon.reverse()
  })

  willThePolygonDataFit('de_dust.obj', polygons, pos, scale, mapData)

  setTexture(textures.wood.aliciaRoomMur02, mapData)

  renderPolygonData(polygons, pos, scale)(mapData)
}
