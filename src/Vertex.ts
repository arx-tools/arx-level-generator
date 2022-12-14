import { ArxVertex } from 'arx-convert/types'
import { Vector2 } from 'three'
import { Color, transparent } from './Color'
import { ArxVertexWithColor } from './types'
import { Vector3 } from './Vector3'

export class Vertex extends Vector3 {
  uv: Vector2
  color: Color

  constructor(x: number, y: number, z: number, u: number = 0, v: number = 0, color: Color = transparent) {
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
}
