import { ArxRotation } from 'arx-convert/types'
import { Euler, EulerOrder, MathUtils } from 'three'

export class Rotation extends Euler {
  static fromArxRotation({ a, b, g }: ArxRotation) {
    return new Rotation(MathUtils.degToRad(a), MathUtils.degToRad(b), MathUtils.degToRad(g), 'XYZ')
  }

  reorder(newOrder: EulerOrder) {
    const { x, y, z } = super.reorder(newOrder)

    this.x = x
    this.y = y
    this.z = z

    return this
  }

  toArxRotation(): ArxRotation {
    this.reorder('XYZ')

    return {
      a: MathUtils.radToDeg(this.x),
      b: MathUtils.radToDeg(this.y),
      g: MathUtils.radToDeg(this.z),
    }
  }
}
