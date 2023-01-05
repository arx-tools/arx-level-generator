import { ArxVector3 } from 'arx-convert/types'
import { Vector3 as ThreeJsVector3 } from 'three'

export class Vector3 extends ThreeJsVector3 {
  static fromArxVector3({ x, y, z }: ArxVector3) {
    return new Vector3(x, y, z)
  }

  toArxVector3(): ArxVector3 {
    return { x: this.x, y: this.y, z: this.z }
  }

  adjustToPlayerHeight() {
    this.y -= 180
    return this
  }
}
