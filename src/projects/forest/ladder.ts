import path from 'path'
import {
  flipPolygonAxis,
  flipTextureUpsideDown,
  loadObj,
  renderPolygonData,
  rotatePolygonData,
  scalePolygonData,
} from '../../assets/models'
import { POLY_CLIMB } from '../../constants'
import { MapData, setTexture } from '../../helpers'
import { RelativeCoords } from '../../types'
import { ArxRotation } from 'arx-level-json-converter/types/binary/BinaryIO'

// source: https://www.turbosquid.com/de/3d-models/free-obj-mode-wooden-staircase/932653
export const createLadder =
  (pos: RelativeCoords, scale: number, rotation: ArxRotation = { a: 0, b: 0, g: 0 }) =>
  async (mapData: MapData) => {
    const polygons = await loadObj(path.resolve('./assets/projects/forest/models/ladder/ladder.obj'))

    flipPolygonAxis('y', polygons)
    rotatePolygonData(rotation, polygons)
    flipTextureUpsideDown(polygons)
    scalePolygonData(scale, polygons)

    setTexture(
      {
        path: 'projects/forest/models/ladder',
        src: 'texture-[wood].jpg',
        native: false,
        flags: POLY_CLIMB,
      },
      mapData,
    )
    renderPolygonData(polygons, pos)(mapData)
  }
