import path from 'path'
import { flipPolygonAxis, loadObj, renderPolygonData, scalePolygonData } from '../../assets/models'
import { textures } from '../../assets/textures'
import { MapData, setTexture } from '../../helpers'
import { RelativeCoords } from '../../types'

// source: https://www.turbosquid.com/de/3d-models/free-tree-3d-model/592617
export const createTree = async (pos: RelativeCoords, scale: number, mapData: MapData) => {
  const polygons = await loadObj(path.resolve('./assets/projects/forest/models/tree/tree.obj'))

  flipPolygonAxis('y', polygons)
  scalePolygonData(scale, polygons)

  setTexture(textures.wood.logs, mapData)
  renderPolygonData(polygons, pos)(mapData)
}
