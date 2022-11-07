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
import { RelativeCoords } from '../../../types'

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

  /*
  polygons = polygons.flatMap(({ texture, polygon }, i) => {
    const isQuad = polygon.length === 4

    // if (!isTooLargePolygon(isQuad, polygon)) {
    //   return [{ texture, polygon }]
    // }

    // ------------------

    if (isQuad) {
      // TODO: subdivide if larger than 100x100
    } else {
      // TODO: subdivide if larger than 100x100
    }

    return [
      { texture, polygon },
      // {
      //   texture,
      //   polygon: clone(polygon).map((vertex) => {
      //     vertex.posY -= 100
      //     return vertex
      //   }),
      // },
    ]
  })
  */

  // --------------------

  willThePolygonDataFit('cs_italy.obj', polygons, pos, scale, mapData)

  setTexture(textures.wood.aliciaRoomMur02, mapData)

  let fits = 0
  let tooLarge = 0

  renderPolygonData(polygons, pos, scale, ({ polygon, texture, isQuad }) => {
    const textureIdx = parseInt(texture.split('_')[1])

    if (isQuad) {
      setColor('black', mapData)
    } else {
      const triangle = toTriangleHelper(polygon)

      if (triangle.doesItFitIntoACell(100)) {
        setColor('green', mapData)
        fits++
      } else {
        setColor('red', mapData)
        tooLarge++
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

  console.log(fits, tooLarge)
}
