import { ArxColor, ArxPolygon, ArxPolygonFlags, ArxTextureContainer, ArxVector3, ArxVertex } from 'arx-convert/types'
import { QuadrupleOf } from 'arx-convert/utils'
import { Triangle } from 'three'
import { Texture } from './Texture'
import { ArxVertexWithColor } from './types'
import { Vector3 } from './Vector3'
import { Vertex } from './Vertex'

type PolygonConfig = {
  areNormalsCalculated: boolean
}

type PolygonContructorProps = {
  vertices: QuadrupleOf<Vertex>
  norm: Vector3
  norm2: Vector3
  texture?: Texture
  flags: ArxPolygonFlags
  normals?: QuadrupleOf<Vector3>
  transval: number
  area: number
  room: number
  paddy?: number
  config: PolygonConfig
}

export class Polygon {
  vertices: QuadrupleOf<Vertex>
  norm: Vector3
  norm2: Vector3
  texture?: Texture
  flags: ArxPolygonFlags
  normals?: QuadrupleOf<Vector3>
  transval: number
  area: number
  room: number
  paddy?: number
  config: PolygonConfig = {
    areNormalsCalculated: false,
  }

  constructor(props: PolygonContructorProps) {
    this.vertices = props.vertices
    this.norm = props.norm
    this.norm2 = props.norm2
    this.texture = props?.texture
    this.flags = props.flags
    this.normals = props.normals
    this.transval = props.transval
    this.area = props.area
    this.room = props.room
    this.paddy = props.paddy
    this.config = props.config
  }

  static fromArxPolygon(
    polygon: ArxPolygon,
    colors: ArxColor[],
    textures: ArxTextureContainer[],
    areNormalsCalculated: boolean,
  ) {
    const extendedVertices = polygon.vertices.map(({ llfColorIdx, ...vertex }) => {
      const extendedVertex: ArxVertexWithColor = vertex
      if (typeof llfColorIdx === 'number') {
        extendedVertex.color = colors[llfColorIdx]
      }
      return Vertex.fromArxVertex(extendedVertex)
    })

    let texture: Texture | undefined = undefined
    const textureContainer = textures.find(({ id }) => id === polygon.textureContainerId)
    if (textureContainer) {
      texture = Texture.fromArxTextureContainer(textureContainer)
    }

    let normals: QuadrupleOf<Vector3> | undefined = undefined
    if (polygon.normals) {
      normals = polygon.normals.map(Vector3.fromArxVector3) as QuadrupleOf<Vector3>
    }

    return new Polygon({
      vertices: extendedVertices as QuadrupleOf<Vertex>,
      norm: Vector3.fromArxVector3(polygon.norm),
      norm2: Vector3.fromArxVector3(polygon.norm2),
      texture,
      flags: polygon.flags,
      normals,
      transval: polygon.transval,
      area: polygon.area,
      room: polygon.room,
      paddy: polygon.paddy,
      config: {
        areNormalsCalculated,
      },
    })
  }

  toArxPolygon(): ArxPolygon {
    const vertices = this.vertices.map((vertex) => {
      return vertex.toArxVertex()
    }) as QuadrupleOf<ArxVertex>

    let textureContainerId = 0 // TODO

    let normals: QuadrupleOf<ArxVector3> | undefined = undefined
    if (this.normals) {
      normals = this.normals.map((normal) => {
        return normal.toArxVector3()
      }) as QuadrupleOf<Vector3>
    }

    return {
      vertices,
      norm: this.norm.toArxVector3(),
      norm2: this.norm.toArxVector3(),
      textureContainerId,
      flags: this.flags,
      normals,
      transval: this.transval,
      area: this.area,
      room: this.room,
      paddy: this.paddy,
    }
  }

  isQuad() {
    return (this.flags & ArxPolygonFlags.Quad) > 0
  }

  calculateNormals() {
    if (this.config.areNormalsCalculated === true) {
      return
    }

    const [a, b, c, d] = this.vertices

    const triangle = new Triangle(a, b, c)
    triangle.getNormal(this.norm)

    if (this.isQuad()) {
      const triangle2 = new Triangle(d, b, c)
      triangle2.getNormal(this.norm2)
    }
  }
}
