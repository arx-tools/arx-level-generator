import path from 'path'
import {
  flipPolygonAxis,
  willThePolygonDataFit,
  loadObj,
  renderPolygonData,
  rotatePolygonData,
} from '../../../assets/models'
import { POLY_DOUBLESIDED, POLY_NO_SHADOW } from '../../../constants'
import { flipUVVertically, MapData, setTexture } from '../../../helpers'
import { RelativeCoords } from '../../../types'

// source: https://free3d.com/3d-model/cs-italy-64059.html
export const createCsItaly = async (pos: RelativeCoords, scale: number, mapData: MapData) => {
  let polygons = await loadObj(path.resolve('./assets/projects/counter-strike/models/cs_italy/cs_italy.obj'))
  flipPolygonAxis('xy', polygons)
  rotatePolygonData({ a: 0, b: 180, g: 0 }, polygons)

  willThePolygonDataFit('cs_italy.obj', polygons, pos, scale, mapData)

  renderPolygonData(polygons, pos, scale, ({ texture }) => {
    setTexture(
      {
        path: 'projects/counter-strike/models/cs_italy/textures',
        src: `cs_italy_${texture}.jpg`,
        native: false,
        flags: POLY_NO_SHADOW,
      },
      mapData,
    )
  })(mapData)
}
