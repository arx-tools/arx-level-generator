import { ArxRotation } from 'arx-convert/types'
import { Euler, MathUtils } from 'three'

export class Rotation extends Euler {
  static fromArxRotation({ a, b, g }: ArxRotation) {
    return new Rotation(MathUtils.degToRad(a), MathUtils.degToRad(b), MathUtils.degToRad(g), 'XYZ')
  }

  toArxRotation(): ArxRotation {
    return {
      a: MathUtils.radToDeg(this.x),
      b: MathUtils.radToDeg(this.y),
      g: MathUtils.radToDeg(this.z),
    }
  }
}
