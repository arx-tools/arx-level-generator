import path from 'path'
import { flipPolygonAxis, loadObj, renderPolygonData, rotatePolygonData } from '../../assets/models'
import { POLY_CLIMB } from '../../constants'
import { MapData, setTexture } from '../../helpers'
import { RelativeCoords } from '../../types'

// source: https://www.turbosquid.com/de/3d-models/free-obj-mode-wooden-staircase/932653
export const createLadder = async (pos: RelativeCoords, scale: number, mapData: MapData) => {
  const polygons = await loadObj(path.resolve('./assets/projects/forest/models/ladder/ladder.obj'))
  setTexture(
    {
      path: 'projects/forest/models/ladder',
      src: 'texture-[wood].jpg',
      native: false,
      flags: POLY_CLIMB,
    },
    mapData,
  )
  flipPolygonAxis('y', polygons)
  rotatePolygonData({ a: -70, b: 0, g: 0 }, polygons)
  polygons.forEach(({ polygon }) => {
    polygon.forEach((vertex) => {
      vertex.texV *= -1
    })
  })

  renderPolygonData(polygons, pos, scale)(mapData)
}
