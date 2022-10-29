import path from 'path'
import {
  flipPolygonAxis,
  willThePolygonDataFit,
  loadObj,
  renderPolygonData,
  rotatePolygonData,
} from '../../../assets/models'
import { MapData } from '../../../helpers'
import { RelativeCoords } from '../../../types'

// source: https://free3d.com/3d-model/cs-italy-64059.html
export const createCsItaly = async (pos: RelativeCoords, scale: number, mapData: MapData) => {
  let polygons = await loadObj(path.resolve('./assets/projects/counter-strike-1.6/models/cs_italy/cs_italy.obj'))
  polygons = flipPolygonAxis('xy', polygons)
  polygons = rotatePolygonData({ a: 0, b: 180, g: 0 }, polygons)

  willThePolygonDataFit('cs_italy.obj', polygons, pos, scale, mapData)

  renderPolygonData(polygons, pos, scale, mapData)
}
