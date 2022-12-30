import { ArxPortal, ArxTextureVertex } from 'arx-convert/types'
import { QuadrupleOf } from 'arx-convert/utils'
import { Vector3 } from './Vector3'

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

  static fromArxPortal(portal: ArxPortal) {
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

  toArxPortal(): ArxPortal {
    return {
      polygon: {
        min: this.min.toArxVector3(),
        max: this.max.toArxVector3(),
        norm: this.norm.toArxVector3(),
        norm2: this.norm2.toArxVector3(),
        vertices: this.vertices.map((vertex): ArxTextureVertex => {
          return {
            pos: vertex.position.toArxVector3(),
            rhw: vertex.rhw,
          }
        }) as QuadrupleOf<ArxTextureVertex>,
        center: this.center.toArxVector3(),
      },
      room1: this.room1,
      room2: this.room2,
      useportal: this.useportal,
      paddy: this.paddy,
    }
  }
}
