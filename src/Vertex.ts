import { ArxVertex } from 'arx-convert/types'
import { Box3, Vector2 } from 'three'
import { Color } from '@src/Color'
import { ArxVertexWithColor } from '@src/types'
import { Vector3 } from '@src/Vector3'

export class Vertex extends Vector3 {
  uv: Vector2
  color: Color

  constructor(x: number, y: number, z: number, u: number = 0, v: number = 0, color: Color = Color.transparent) {
    super(x, y, z)
    this.uv = new Vector2(u, v)
    this.color = color
  }

  static fromArxVertex({ x, y, z, u, v, color }: ArxVertexWithColor) {
    if (typeof color === 'undefined') {
      return new Vertex(x, y, z, u, v)
    }

    return new Vertex(x, y, z, u, v, Color.fromArxColor(color))
  }

  toArxVertex(): ArxVertex {
    return {
      ...this.toArxVector3(),
      u: this.uv.x,
      v: this.uv.y,
    }
  }

  equals(v: Vector3, epsilon: number = 0) {
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
