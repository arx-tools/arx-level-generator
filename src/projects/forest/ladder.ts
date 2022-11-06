import path from 'path'
import {
  flipPolygonAxis,
  flipTextureUpsideDown,
  loadObj,
  renderPolygonData,
  rotatePolygonData,
} from '../../assets/models'
import { POLY_CLIMB } from '../../constants'
import { MapData, setTexture } from '../../helpers'
import { RelativeCoords, RotationVertex3 } from '../../types'

// source: https://www.turbosquid.com/de/3d-models/free-obj-mode-wooden-staircase/932653
export const createLadder =
  (pos: RelativeCoords, scale: number, rotation: RotationVertex3 = { a: 0, b: 0, g: 0 }) =>
  async (mapData: MapData) => {
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
    rotatePolygonData(rotation, polygons)
    flipTextureUpsideDown(polygons)

    renderPolygonData(polygons, pos, scale)(mapData)
  }
