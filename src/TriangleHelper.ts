import { Vector3, MathUtils } from 'three'

const basically45 = 45 + 45 * Number.EPSILON

export class TriangleHelper {
  a: Vector3
  b: Vector3
  c: Vector3
  abLength: number
  bcLength: number
  caLength: number
  cAngle: number
  aAngle: number
  bAngle: number

  constructor(a: Vector3, b: Vector3, c: Vector3) {
    this.a = a
    this.b = b
    this.c = c

    this.abLength = a.distanceTo(b)
    this.bcLength = b.distanceTo(c)
    this.caLength = c.distanceTo(a)

    this.aAngle = MathUtils.radToDeg(b.clone().sub(a).angleTo(c.clone().sub(a)))
    this.bAngle = MathUtils.radToDeg(c.clone().sub(b).angleTo(a.clone().sub(b)))
    this.cAngle = MathUtils.radToDeg(a.clone().sub(c).angleTo(b.clone().sub(c)))
  }

  getShortestSide() {
    return Math.min(this.abLength, this.bcLength, this.caLength)
  }

  getLongestSide() {
    return Math.max(this.abLength, this.bcLength, this.caLength)
  }

  // source: https://www.geogebra.org/m/kFQdmJYb and https://www.geogebra.org/m/Q7m8ngqj
  getSmallestEnclosingSquareSideLength() {
    // if the angles of the longest side are both <= 45, then the longest side is the square's diagonal

    const longestSide = this.getLongestSide()
    const squareSideLength = longestSide / Math.SQRT2

    if (longestSide === this.abLength) {
      if (this.aAngle <= basically45 && this.bAngle <= basically45) {
        return squareSideLength
      }
    } else if (longestSide === this.bcLength) {
      if (this.bAngle <= basically45 && this.cAngle <= basically45) {
        return squareSideLength
      }
    } else {
      if (this.cAngle <= basically45 && this.aAngle <= basically45) {
        return squareSideLength
      }
    }

    // else:
    // 1) get the 2 angles of the triangle's shortest side, the point at the smaller angle will be the corner of the square
    // 2) the triangle's other line from the corner will be the hypotenuse of a right triangle
    // 3) the right triangle's adjacent side will be the square's side
    //    the adjacent side can be calculated by multiplying the hypotenuse with the sine of opposing angle
    //    the opposing angle is the same as the original triangle's smaller angle

    let hypotenuse: number
    let opposingExterialAngle: number

    const shortestSide = this.getShortestSide()
    if (shortestSide === this.abLength) {
      if (this.aAngle < this.bAngle) {
        hypotenuse = this.caLength
        opposingExterialAngle = this.aAngle
      } else {
        hypotenuse = this.bcLength
        opposingExterialAngle = this.bAngle
      }
    } else if (shortestSide === this.bcLength) {
      if (this.bAngle < this.cAngle) {
        hypotenuse = this.abLength
        opposingExterialAngle = this.bAngle
      } else {
        hypotenuse = this.caLength
        opposingExterialAngle = this.cAngle
      }
    } else {
      if (this.cAngle < this.aAngle) {
        hypotenuse = this.bcLength
        opposingExterialAngle = this.cAngle
      } else {
        hypotenuse = this.abLength
        opposingExterialAngle = this.aAngle
      }
    }

    return hypotenuse * Math.sin(MathUtils.degToRad(opposingExterialAngle))
  }

  doesItFitIntoACell(cellSize: number) {
    const cellDigonalSize = cellSize * Math.SQRT2

    if (
      this.abLength > cellDigonalSize + cellDigonalSize * Number.EPSILON ||
      this.bcLength > cellDigonalSize + cellDigonalSize * Number.EPSILON ||
      this.caLength > cellDigonalSize + cellDigonalSize * Number.EPSILON
    ) {
      return false
    }

    return this.getSmallestEnclosingSquareSideLength() <= cellSize + cellSize * Number.EPSILON
  }
}
