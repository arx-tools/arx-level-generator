import path from 'path'
import {
  flipPolygonAxis,
  willThePolygonDataFit,
  loadObj,
  renderPolygonData,
  rotatePolygonData,
  removeInvisiblePolygons,
  toTriangleHelper,
  turnPolygonDataInsideOut,
} from '../../../assets/models'
import { textures } from '../../../assets/textures'
import { POLY_GLOW, POLY_NO_SHADOW, POLY_TRANS } from '../../../constants'
import { MapData, setColor, setTexture } from '../../../helpers'
import { RelativeCoords, PosVertex3 } from '../../../types'

// source: https://free3d.com/3d-model/cs-italy-64059.html
export const createCsItaly = async (pos: RelativeCoords, scale: number, mapData: MapData) => {
  let polygons = await loadObj(path.resolve('./assets/projects/counter-strike/models/cs_italy/cs_italy.obj'))
  flipPolygonAxis('xy', polygons)
  rotatePolygonData({ a: 0, b: 180, g: 0 }, polygons)
  turnPolygonDataInsideOut(polygons)

  polygons = removeInvisiblePolygons(polygons)

  // --------------------

  // UNDER CONSTRUCTION

  // polygons = polygons.slice(10390, 10550)

  polygons = polygons.flatMap(({ texture, polygon }, i) => {
    const isQuad = polygon.length === 4

    if (isQuad) {
      // measure whether the polygon(quad) fits into a 100x100 square

      // if (it fits) {
      return [{ texture, polygon }]
      // }
    } else {
      const triangle = toTriangleHelper(polygon)

      if (triangle.doesItFitIntoACell(100)) {
        return [{ texture, polygon }]
      }
    }

    // TODO: subdivide polygon

    const subPolys: PosVertex3[][] = []

    subPolys.push(polygon)

    return subPolys.map((polygon) => {
      return { texture, polygon }
    })
  })

  // --------------------

  willThePolygonDataFit('cs_italy.obj', polygons, pos, scale, mapData)

  setTexture(textures.wood.aliciaRoomMur02, mapData)

  let fits3 = 0
  let tooLarge3 = 0
  let fits4 = 0
  let tooLarge4 = 0

  renderPolygonData(polygons, pos, scale, ({ polygon, texture, isQuad }) => {
    const textureIdx = parseInt(texture.split('_')[1])

    if (isQuad) {
      let doesItFit = false

      if (doesItFit) {
        fits4++
        setColor('#030', mapData)
      } else {
        tooLarge4++
        setColor('#300', mapData)
      }
    } else {
      const triangle = toTriangleHelper(polygon)

      if (triangle.doesItFitIntoACell(100)) {
        fits3++
        setColor('green', mapData)
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
