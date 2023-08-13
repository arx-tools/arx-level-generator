import { ArxRotation } from 'arx-convert/types'
import { Euler, MathUtils } from 'three'

export class Rotation extends Euler {
  static fromArxRotation({ a, b, g }: ArxRotation) {
    return new Rotation(MathUtils.degToRad(a), MathUtils.degToRad(b), MathUtils.degToRad(g), 'XYZ')
  }

  toArxRotation(): ArxRotation {
    const { x, y, z } = this.reorder('XYZ')

    return {
      a: MathUtils.radToDeg(x),
      b: MathUtils.radToDeg(y),
      g: MathUtils.radToDeg(z),
    }
  }
}
