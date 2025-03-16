import type { ArxVector3 } from 'arx-convert/types'
import { Vector3 as ThreeJsVector3 } from 'three'

// calculated mostly by trial and error
// see also: https://github.com/arx-tools/asl-cookbook/blob/main/docs/entity-sizes/entity-sizes.md#player--human_base
const heightOfThePlayer = 180

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

  toArxData(): ArxVector3 {
    return { x: this.x, y: this.y, z: this.z }
  }

  toString(): string {
    return `${this.x}|${this.y}|${this.z}`
  }

  /**
   * move the player higher by the amount of the player's height
   * so that he doesn't sink into the floor
   *
   * @see https://youtu.be/JDsSUrjikW4?si=ku7wVtHOMfd-cLC-&t=171
   */
  adjustToPlayerHeight(): this {
    this.y = this.y - heightOfThePlayer
    return this
  }
}
