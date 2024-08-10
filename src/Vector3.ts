import { type ArxVector3 } from 'arx-convert/types'
import { Vector3 as ThreeJsVector3 } from 'three'

export class Vector3 extends ThreeJsVector3 {
  static fromArxVector3({ x, y, z }: ArxVector3): Vector3 {
    return new Vector3(x, y, z)
  }

  static fromString(stringifiedVector: string): Vector3 {
    const [x, y, z] = stringifiedVector.split('|')
    return new Vector3(Number.parseFloat(x) || 0, Number.parseFloat(y) || 0, Number.parseFloat(z) || 0)
  }

  static fromThreeJsVector3(vector: ThreeJsVector3): Vector3 {
    return new Vector3(vector.x, vector.y, vector.z)
  }

  toArxVector3(): ArxVector3 {
    return { x: this.x, y: this.y, z: this.z }
  }

  toString(): string {
    return `${this.x}|${this.y}|${this.z}`
  }

  adjustToPlayerHeight(): this {
    this.y = this.y - 180
    return this
  }
}
