import type { ArxPortal, ArxTextureVertex } from 'arx-convert/types'
import type { QuadrupleOf } from 'arx-convert/utils'
import { Vector3 } from '@src/Vector3.js'

type TextureVertex = {
  position: Vector3
  rhw: number
}

type PortalConstructorProps = {
  min: Vector3
  max: Vector3
  norm: Vector3
  norm2: Vector3
  vertices: QuadrupleOf<TextureVertex>
  center: Vector3
  room1: number
  room2: number
  useportal: number
  paddy: number
}

export class Portal {
  static fromArxPortal(portal: ArxPortal): Portal {
    return new Portal({
      min: Vector3.fromArxVector3(portal.polygon.min),
      max: Vector3.fromArxVector3(portal.polygon.max),
      norm: Vector3.fromArxVector3(portal.polygon.norm),
      norm2: Vector3.fromArxVector3(portal.polygon.norm2),
      vertices: portal.polygon.vertices.map((vertex): TextureVertex => {
        return {
          position: Vector3.fromArxVector3(vertex.pos),
          rhw: vertex.rhw,
        }
      }) as QuadrupleOf<TextureVertex>,
      center: Vector3.fromArxVector3(portal.polygon.center),
      room1: portal.room1,
      room2: portal.room2,
      useportal: portal.useportal,
      paddy: portal.paddy,
    })
  }

  min: Vector3
  max: Vector3
  norm: Vector3
  norm2: Vector3
  vertices: QuadrupleOf<TextureVertex>
  center: Vector3
  room1: number
  room2: number
  useportal: number
  paddy: number

  constructor(props: PortalConstructorProps) {
    this.min = props.min
    this.max = props.max
    this.norm = props.norm
    this.norm2 = props.norm2
    this.vertices = props.vertices
    this.center = props.center
    this.room1 = props.room1
    this.room2 = props.room2
    this.useportal = props.useportal
    this.paddy = props.paddy
  }

  toArxData(): ArxPortal {
    return {
      polygon: {
        min: this.min.toArxData(),
        max: this.max.toArxData(),
        norm: this.norm.toArxData(),
        norm2: this.norm2.toArxData(),
        vertices: this.vertices.map((vertex) => {
          return {
            pos: vertex.position.toArxData(),
            rhw: vertex.rhw,
          }
        }) as QuadrupleOf<ArxTextureVertex>,
        center: this.center.toArxData(),
      },
      room1: this.room1,
      room2: this.room2,
      useportal: this.useportal,
      paddy: this.paddy,
    }
  }
}
