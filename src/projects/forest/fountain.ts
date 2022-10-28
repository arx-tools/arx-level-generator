import path from 'path'
import { loadObj, renderPolygonData } from '../../assets/models'
import { textures } from '../../assets/textures'
import { MapData, setTexture } from '../../helpers'
import { RelativeCoords } from '../../types'

// source: https://www.turbosquid.com/de/3d-models/free-fountain-3d-model/615012
export const createFountain = async (pos: RelativeCoords, scale: number, mapData: MapData) => {
  const polygons = await loadObj(path.resolve('./assets/projects/forest/models/fountain/fountain.obj'))
  setTexture(textures.wood.aliciaRoomMur02, mapData)
  renderPolygonData(polygons, pos, scale, mapData)
}
