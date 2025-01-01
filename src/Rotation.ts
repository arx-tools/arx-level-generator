import { type ArxRotation } from 'arx-convert/types'
import { Euler, type EulerOrder, MathUtils } from 'three'

export class Rotation extends Euler {
  static fromArxRotation({ a, b, g }: ArxRotation): Rotation {
    return new Rotation(MathUtils.degToRad(a), MathUtils.degToRad(b), MathUtils.degToRad(g), 'XYZ')
  }

  static fromThreeJsEuler(euler: Euler): Rotation {
    return new Rotation(euler.x, euler.y, euler.z)
  }

  reorder(newOrder: EulerOrder): this {
    const { x, y, z } = super.reorder(newOrder)

    this.x = x
    this.y = y
    this.z = z

    return this
  }

  toArxData(): ArxRotation {
    return {
      a: MathUtils.radToDeg(this.x),
      b: MathUtils.radToDeg(this.y),
      g: MathUtils.radToDeg(this.z),
    }
  }
}
