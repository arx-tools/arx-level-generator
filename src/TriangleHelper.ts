import { Triangle, Vector3, MathUtils } from 'three'

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

  constructor({ a, b, c }: Triangle) {
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
    const longestSide = this.getLongestSide()
    const squareSideLength = longestSide / Math.SQRT2

    // if the third vertex is in the square with the greatest side as diagonal then this is the required square
    // ( in the square = angles of the longest side are both <= 45 )

    const basically45 = 45 + Number.EPSILON

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

    // ------------------

    // 1) get the 2 angles of the triangle's shortest side, the point at the smaller angle will be corner1 of the square
    // 2) create a line perpendicular to the triangle's shortest side starting from the square's corner
    // 3) create a line parallel to the triangle's shortest side, but move it so it touches the triangle's opposing point
    // 4) intersect lines created at 2) and 3), that will be corner2 of the square

    let corner1: Vector3
    let corner2: Vector3

    const shortestSide = this.getShortestSide()
    if (shortestSide === this.abLength) {
      corner1 = this.aAngle < this.bAngle ? this.a : this.b
    } else if (shortestSide === this.bcLength) {
      corner1 = this.bAngle < this.cAngle ? this.b : this.c
    } else {
      corner1 = this.cAngle < this.aAngle ? this.c : this.a
    }

    console.log(corner1)

    // ------------------

    return 1000
  }

  doesItFitIntoACell(cellSize: number) {
    const cellDigonalSize = cellSize * Math.SQRT2

    if (this.abLength > cellDigonalSize || this.bcLength > cellDigonalSize || this.caLength > cellDigonalSize) {
      return false
    }

    return this.getSmallestEnclosingSquareSideLength() <= cellSize
  }
}
