import type { ArxVertex } from 'arx-convert/types'
import { Vector2 } from 'three'
import { Color } from '@src/Color.js'
import { Vector3 } from '@src/Vector3.js'
import type { ArxVertexWithColor } from '@src/types.js'

export class Vertex extends Vector3 {
  static fromArxVertex({ x, y, z, u, v, color }: ArxVertexWithColor): Vertex {
    if (color === undefined) {
      return new Vertex(x, y, z, u, v)
    }

    return new Vertex(x, y, z, u, v, Color.fromArxColor(color))
  }

  uv: Vector2
  color: Color

  // eslint-disable-next-line max-params -- have to keep the parameters for compatibility with three.js' Vector3
  constructor(x: number, y: number, z: number, u: number = 0, v: number = 0, color: Color = Color.transparent) {
    super(x, y, z)
    this.uv = new Vector2(u, v)
    this.color = color
  }

  clone(): this {
    const copy = new Vertex(this.x, this.y, this.z, this.uv.x, this.uv.y, this.color)
    return copy as this
  }

  toArxVertex(): ArxVertex {
    return {
      ...this.toArxVector3(),
      u: this.uv.x,
      v: this.uv.y,
    }
  }

  equals(v: Vector3, epsilon: number = 0): boolean {
    if (epsilon === 0) {
      return this.x === v.x && this.y === v.y && this.z === v.z
    }

    if (Math.abs(this.x - v.x) > epsilon) {
      return false
    }

    if (Math.abs(this.y - v.y) > epsilon) {
      return false
    }

    if (Math.abs(this.z - v.z) > epsilon) {
      return false
    }

    return true
  }
}
