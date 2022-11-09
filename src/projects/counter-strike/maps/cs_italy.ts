import path from 'path'
import {
  flipPolygonAxis,
  willThePolygonDataFit,
  loadObj,
  renderPolygonData,
  rotatePolygonData,
  removeInvisiblePolygons,
  turnPolygonDataInsideOut,
  scalePolygonData,
  subdividePolygonData,
} from '../../../assets/models'
import { textures } from '../../../assets/textures'
import { POLY_GLOW, POLY_NO_SHADOW, POLY_TRANS } from '../../../constants'
import { MapData, setColor, setTexture } from '../../../helpers'
import { doesPolygonFitIntoACell } from '../../../subdivisionHelper'
import { RelativeCoords } from '../../../types'

// source: https://free3d.com/3d-model/cs-italy-64059.html
export const createCsItaly = async (pos: RelativeCoords, scale: number, mapData: MapData) => {
  let polygons = await loadObj(path.resolve('./assets/projects/counter-strike/models/cs_italy/cs_italy.obj'))

  polygons = removeInvisiblePolygons(polygons)

  flipPolygonAxis('xy', polygons)
  rotatePolygonData({ a: 0, b: 180, g: 0 }, polygons)
  turnPolygonDataInsideOut(polygons)
  scalePolygonData(scale, polygons)

  polygons = subdividePolygonData(polygons)

  willThePolygonDataFit('cs_italy.obj', polygons, pos, mapData)

  setTexture(textures.wood.aliciaRoomMur02, mapData)

  let fits = 0
  let tooLarge = 0

  renderPolygonData(polygons, pos, ({ polygon, texture }) => {
    const textureIdx = parseInt(texture.split('_')[1])

    if (doesPolygonFitIntoACell(polygon)) {
      fits++
      setColor('green', mapData)
    } else {
      tooLarge++
      setColor('red', mapData)
    }

    let flags = POLY_NO_SHADOW

    if (textureIdx >= 80) {
      flags |= POLY_TRANS
    }

    if (textureIdx === 32 || textureIdx === 43) {
      flags |= POLY_GLOW
    }

    // setTexture(
    //   {
    //     path: 'projects/counter-strike/models/cs_italy/textures',
    //     src: `cs_italy_texture_${textureIdx}.jpg`,
    //     native: false,
    //     flags,
    //   },
    //   mapData,
    // )
  })(mapData)

  console.log({ fits, tooLarge })
}
