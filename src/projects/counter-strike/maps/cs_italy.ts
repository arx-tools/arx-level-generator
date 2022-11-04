import path from 'path'
import {
  flipPolygonAxis,
  willThePolygonDataFit,
  loadObj,
  renderPolygonData,
  rotatePolygonData,
} from '../../../assets/models'
import { textures } from '../../../assets/textures'
import { POLY_GLOW, POLY_NO_SHADOW, POLY_STONE, POLY_TRANS } from '../../../constants'
import { clone, uniq } from '../../../faux-ramda'
import { MapData, setColor, setTexture } from '../../../helpers'
import { PosVertex3, RelativeCoords } from '../../../types'

const isTooLargePolygon = (isQuad: boolean, polygon: PosVertex3[]) => {
  // TODO: this ignores the Y coordinate altogether resulting in a projection rather than the true dimensions of a polygon

  const v = polygon.slice(0, isQuad ? 4 : 3)
  const xs = v.map(({ posX }) => posX)
  const zs = v.map(({ posZ }) => posZ)

  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minZ = Math.min(...zs)
  const maxZ = Math.max(...zs)

  const sizeX = Math.abs(maxX - minX)
  const sizeZ = Math.abs(maxZ - minZ)

  return sizeX > 100 || sizeZ > 100
}

// source: https://free3d.com/3d-model/cs-italy-64059.html
export const createCsItaly = async (pos: RelativeCoords, scale: number, mapData: MapData) => {
  let polygons = await loadObj(path.resolve('./assets/projects/counter-strike/models/cs_italy/cs_italy.obj'))
  flipPolygonAxis('xy', polygons)
  rotatePolygonData({ a: 0, b: 180, g: 0 }, polygons)

  polygons.forEach(({ polygon }, i) => {
    polygons[i].polygon = polygon.reverse()
  })

  // --------------------

  // UNDER CONSTRUCTION

  polygons = polygons.slice(10350, 10400)

  polygons = polygons.flatMap(({ texture, polygon }, i) => {
    const isQuad = polygon.length === 4

    if (isTooLargePolygon(isQuad, polygon)) {
      if (isQuad) {
        // TODO: subdivide if larger than 100x100
      } else {
        // TODO: subdivide if larger than 100x100
      }
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

  // --------------------

  willThePolygonDataFit('cs_italy.obj', polygons, pos, scale, mapData)

  setTexture(textures.wood.aliciaRoomMur02, mapData)

  renderPolygonData(polygons, pos, scale, ({ polygon, texture, isQuad }) => {
    const textureIdx = parseInt(texture.split('_')[1])

    if (isTooLargePolygon(isQuad, polygon)) {
      setColor('red', mapData)
    } else {
      setColor('black', mapData)
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
}
