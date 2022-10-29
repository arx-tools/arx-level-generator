import path from 'path'
import { flipPolygonAxis, loadObj, renderPolygonData } from '../../assets/models'
import { MapData, setTexture } from '../../helpers'
import { RelativeCoords } from '../../types'

// source: https://www.turbosquid.com/de/3d-models/free-fountain-3d-model/615012
export const createFountain = async (pos: RelativeCoords, scale: number, mapData: MapData) => {
  const polygons = await loadObj(path.resolve('./assets/projects/forest/models/fountain/fountain.obj'))
  setTexture(
    {
      path: 'projects/forest/models/fountain',
      src: 'fountain-[stone].jpg',
      native: false,
    },
    mapData,
  )
  flipPolygonAxis('y', polygons)
  polygons.forEach(({ polygon }) => {
    polygon.forEach((vertex) => {
      vertex.texV *= -1
    })
  })
  renderPolygonData(polygons, pos, scale)(mapData)
}
