import { ArxRotation } from 'arx-convert/types'
import { Euler } from 'three'

export class Rotation extends Euler {
  static fromArxRotation({ a, b, g }: ArxRotation) {
    return new Rotation(a, b, g, 'XYZ')
  }

  toArxRotation(): ArxRotation {
    this.reorder('XYZ')

    return {
      a: this.x,
      b: this.y,
      g: this.z,
    }
  }
}
