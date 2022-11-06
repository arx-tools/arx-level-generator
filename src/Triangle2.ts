import { Triangle, Vector3, MathUtils, Vector2 } from 'three'

export class Triangle2 extends Triangle {
  abLength: number = 0
  bcLength: number = 0
  caLength: number = 0
  cAngle: number = 0
  aAngle: number = 0
  bAngle: number = 0

  constructor(a: Vector3, b: Vector3, c: Vector3) {
    super(a, b, c)
    this.calculateLengthsAndAngles()
  }

  private calculateLengthsAndAngles() {
    this.abLength = this.a.distanceTo(this.b)
    this.bcLength = this.b.distanceTo(this.c)
    this.caLength = this.c.distanceTo(this.a)

    this.aAngle = MathUtils.radToDeg(this.b.clone().sub(this.a).angleTo(this.c.clone().sub(this.a)))
    this.bAngle = MathUtils.radToDeg(this.c.clone().sub(this.b).angleTo(this.a.clone().sub(this.b)))
    this.cAngle = MathUtils.radToDeg(this.a.clone().sub(this.c).angleTo(this.b.clone().sub(this.c)))
  }

  isAcute() {
    return this.cAngle < 90 && this.aAngle < 90 && this.bAngle < 90
  }

  isRight() {
    return this.cAngle === 90 || this.aAngle === 90 || this.bAngle === 90
  }

  isObtuse() {
    return this.cAngle > 90 || this.aAngle > 90 || this.bAngle > 90
  }

  getLongestSide() {
    return Math.max(this.abLength, this.bcLength, this.caLength)
  }

  to2DShape() {
    const origin = new Vector2(0, 0)

    const a = new Vector2(1, 1)
    a.rotateAround(origin, this.cAngle)
    a.multiplyScalar(this.abLength)

    const b = new Vector2(1, 1)
    b.rotateAround(origin, this.cAngle + this.aAngle)
    b.multiplyScalar(this.bcLength)
    b.add(a)

    const c = new Vector2(1, 1)
    c.rotateAround(origin, this.cAngle + this.aAngle + this.bAngle)
    c.multiplyScalar(this.caLength)
    c.add(b)

    return [a, b, c]
  }

  // source: https://www.geogebra.org/m/kFQdmJYb
  getSmallestEnclosingSquareSideLength() {
    const longestSide = this.getLongestSide()
    const squareSideLength = longestSide / Math.SQRT2

    if (longestSide === this.abLength) {
      if (this.aAngle <= 45 + Number.EPSILON && this.bAngle <= 45 + Number.EPSILON) {
        return squareSideLength
      }
    }
    if (longestSide === this.bcLength) {
      if (this.bAngle <= 45 + Number.EPSILON && this.cAngle <= 45 + Number.EPSILON) {
        return squareSideLength
      }
    }
    if (longestSide === this.caLength) {
      if (this.cAngle <= 45 + Number.EPSILON && this.aAngle <= 45 + Number.EPSILON) {
        return squareSideLength
      }
    }

    // const [a, b, c] = this.to2DShape()

    // TODO: you must solve a trigonometric equation

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
