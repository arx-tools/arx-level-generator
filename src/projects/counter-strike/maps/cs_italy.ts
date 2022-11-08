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
} from '../../../assets/models'
import { textures } from '../../../assets/textures'
import { POLY_GLOW, POLY_NO_SHADOW, POLY_TRANS } from '../../../constants'
import { MapData, setColor, setTexture } from '../../../helpers'
import { doesPolygonFitIntoACell, toTriangleHelper } from '../../../subdivisionHelper'
import { RelativeCoords, PosVertex3 } from '../../../types'

// source: https://free3d.com/3d-model/cs-italy-64059.html
export const createCsItaly = async (pos: RelativeCoords, scale: number, mapData: MapData) => {
  let polygons = await loadObj(path.resolve('./assets/projects/counter-strike/models/cs_italy/cs_italy.obj'))

  polygons = removeInvisiblePolygons(polygons)

  flipPolygonAxis('xy', polygons)
  rotatePolygonData({ a: 0, b: 180, g: 0 }, polygons)
  turnPolygonDataInsideOut(polygons)
  scalePolygonData(scale, polygons)

  // --------------------

  // UNDER CONSTRUCTION

  // polygons = polygons.slice(10000, 10500)

  // polygons = polygons.flatMap(({ texture, polygon }, i) => {
  //   const isQuad = polygon.length === 4

  //   /*
  //   if (!isQuad) {
  //     const triangle = toTriangleHelper(polygon)
  //     const x = triangle.getSmallestEnclosingSquareSideLength()
  //     console.log(x)
  //   }
  //   */

  //   if (doesPolygonFitIntoACell(polygon, isQuad)) {
  //     return [{ texture, polygon }]
  //   }

  //   // TODO: subdivide polygon

  //   const subPolys: PosVertex3[][] = []

  //   subPolys.push(polygon)

  //   return subPolys.map((polygon) => {
  //     return { texture, polygon }
  //   })
  // })

  // --------------------

  willThePolygonDataFit('cs_italy.obj', polygons, pos, mapData)

  setTexture(textures.wood.aliciaRoomMur02, mapData)

  let fits3 = 0
  let fits4 = 0
  let tooLarge3 = 0
  let tooLarge4 = 0

  let isFirst = true

  renderPolygonData(polygons, pos, ({ polygon, texture, isQuad }) => {
    if (isFirst) {
      isFirst = false

      console.log(polygon)
    }

    const textureIdx = parseInt(texture.split('_')[1])

    if (doesPolygonFitIntoACell(polygon, isQuad)) {
      if (isQuad) {
        fits4++
        setColor('#030', mapData)
      } else {
        fits3++
        setColor('green', mapData)
      }
    } else {
      if (isQuad) {
        tooLarge4++
        setColor('#300', mapData)
      } else {
        tooLarge3++
        setColor('red', mapData)
      }
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

  console.log({ fits3, tooLarge3, fits4, tooLarge4 })
}
