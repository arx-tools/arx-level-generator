import { ArxVector3 } from 'arx-convert/types'
import { Vector3 as ThreeJsVector3 } from 'three'

export class Vector3 extends ThreeJsVector3 {
  static fromArxVector3({ x, y, z }: ArxVector3) {
    return new Vector3(x, y, z)
  }

  static fromString(stringifiedVector: string) {
    const [x, y, z] = stringifiedVector.split('|')
    return new Vector3(parseFloat(x) || 0, parseFloat(y) || 0, parseFloat(z) || 0)
  }

  static fromThreeJsVector3(vector: ThreeJsVector3) {
    return new Vector3(vector.x, vector.y, vector.z)
  }

  toArxVector3(): ArxVector3 {
    return { x: this.x, y: this.y, z: this.z }
  }

  toString() {
    return `${this.x}|${this.y}|${this.z}`
  }

  adjustToPlayerHeight() {
    this.y -= 180
    return this
  }
}
