import path from 'path'
import {
  flipPolygonAxis,
  willThePolygonDataFit,
  loadObj,
  renderPolygonData,
  rotatePolygonData,
} from '../../../assets/models'
import { textures } from '../../../assets/textures'
import { POLY_GLOW, POLY_NO_SHADOW, POLY_TRANS } from '../../../constants'
import { MapData, setColor, setTexture } from '../../../helpers'
import { PosVertex3, RelativeCoords } from '../../../types'
import { Triangle, Vector3, MathUtils, Vector2 } from 'three'

class Triangle2 extends Triangle {
  abLength: number = 0
  bcLength: number = 0
  caLength: number = 0
  abAngle: number = 0
  bcAngle: number = 0
  caAngle: number = 0

  constructor(a: Vector3, b: Vector3, c: Vector3) {
    super(a, b, c)
    this.calculateLengthsAndAngles()
  }

  private calculateLengthsAndAngles() {
    this.abLength = this.a.distanceTo(this.b)
    this.bcLength = this.b.distanceTo(this.c)
    this.caLength = this.c.distanceTo(this.a)

    this.abAngle = MathUtils.radToDeg(this.a.clone().sub(this.c).angleTo(this.b.clone().sub(this.c)))
    this.bcAngle = MathUtils.radToDeg(this.b.clone().sub(this.a).angleTo(this.c.clone().sub(this.a)))
    this.caAngle = MathUtils.radToDeg(this.c.clone().sub(this.b).angleTo(this.a.clone().sub(this.b)))
  }

  isAcute() {
    return this.abAngle < 90 && this.bcAngle < 90 && this.caAngle < 90
  }

  isRight() {
    return this.abAngle === 90 || this.bcAngle === 90 || this.caAngle === 90
  }

  isObtuse() {
    return this.abAngle > 90 || this.bcAngle > 90 || this.caAngle > 90
  }

  getLongestSide() {
    return Math.max(this.abLength, this.bcLength, this.caLength)
  }

  getHeight() {
    const base = this.getLongestSide()
    return (2 * this.getArea()) / base
  }

  doesItFitIntoACell() {
    /*
    if (this.isRight()) {
      const hypotenuse = this.getLongestSide()
      if (hypotenuse === this.abLength) {
        return [this.bcLength, this.caLength]
      } else if (hypotenuse === this.bcLength) {
        return [this.abLength, this.caLength]
      } else {
        return [this.abLength, this.bcLength]
      }
    }

    if (this.isAcute()) {
    const origin = new Vector2(0, 0)

    const a = new Vector2(1, 1)
    a.rotateAround(origin, this.abAngle)
    a.multiplyScalar(this.abLength)

    const b = new Vector2(1, 1)
    b.rotateAround(origin, this.abAngle + this.bcAngle)
    b.multiplyScalar(this.bcLength)
    b.add(a)

    const c = new Vector2(1, 1)
    c.rotateAround(origin, this.abAngle + this.bcAngle + this.caAngle)
    c.multiplyScalar(this.caLength)
    c.add(b)

    const minX = Math.min(a.x, b.x, c.x)
    const maxX = Math.max(a.x, b.x, c.x)
    const minY = Math.min(a.y, b.y, c.y)
    const maxY = Math.max(a.y, b.y, c.y)
    const width = maxX - minX
    const height = maxY - minY

    return [width, height]
    }
    */

    // const base = this.getLongestSide()
    // const height = this.getHeight()

    // -----------

    // fits -- too large | total = 2018

    // 631 -- 1387
    if (this.abLength > Math.SQRT2 * 100 || this.bcLength > Math.SQRT2 * 100 || this.caLength > Math.SQRT2 * 100) {
      return false
    }

    // TODO: implement more exclusions of valid cases

    return true
  }
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

  // polygons = polygons.slice(10390, 10400)

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

  // --------------------

  willThePolygonDataFit('cs_italy.obj', polygons, pos, scale, mapData)

  setTexture(textures.wood.aliciaRoomMur02, mapData)

  let fits: number = 0
  let tooLarge: number = 0

  renderPolygonData(polygons, pos, scale, ({ polygon, texture, isQuad }) => {
    const textureIdx = parseInt(texture.split('_')[1])

    /*
    if (isTooLargePolygon(isQuad, polygon)) {
      setColor('red', mapData)
    } else {
      setColor('black', mapData)
    }
    */

    if (isQuad) {
      setColor('black', mapData)
    } else {
      const v = polygon.slice(0, isQuad ? 4 : 3)
      const a = new Vector3(v[0].posX, v[0].posY, v[0].posZ)
      const b = new Vector3(v[1].posX, v[1].posY, v[1].posZ)
      const c = new Vector3(v[2].posX, v[2].posY, v[2].posZ)

      const triangle = new Triangle2(a, b, c)

      if (triangle.doesItFitIntoACell()) {
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
