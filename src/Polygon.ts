import { ArxColor, ArxPolygon, ArxPolygonFlags, ArxTextureContainer, ArxVertex } from 'arx-convert/types'
import { QuadrupleOf } from 'arx-convert/utils'
import { Triangle } from 'three'
import { Texture } from './Texture'
import { ArxVertexWithColor } from './types'
import { Vector3 } from './Vector3'
import { Vertex } from './Vertex'

type PolygonContructorProps = {
  vertices: QuadrupleOf<Vertex>
  norm: Vector3
  norm2: Vector3
  polygonData: Omit<ArxPolygon, 'vertices' | 'norm' | 'norm2' | 'textureContainerId' | 'flags'>
  texture?: Texture
  flags: ArxPolygonFlags
  normalsCalculated: boolean
}

export class Polygon {
  vertices: [Vertex, Vertex, Vertex, Vertex]
  norm: Vector3
  norm2: Vector3
  polygonData: Omit<ArxPolygon, 'vertices' | 'norm' | 'norm2' | 'textureContainerId' | 'flags'>
  texture?: Texture
  flags: ArxPolygonFlags
  normalsCalculated: boolean

  constructor(props: PolygonContructorProps) {
    this.vertices = props.vertices
    this.norm = props.norm
    this.norm2 = props.norm2
    this.polygonData = props.polygonData
    this.texture = props?.texture
    this.flags = props.flags
    this.normalsCalculated = props.normalsCalculated
  }

  static fromArxPolygon(
    { vertices, norm, norm2, textureContainerId, flags, ...polygonData }: ArxPolygon,
    colors: ArxColor[],
    textures: ArxTextureContainer[],
    normalsCalculated: boolean,
  ) {
    const extendedVertices = vertices.map(({ llfColorIdx, ...vertex }) => {
      const extendedVertex: ArxVertexWithColor = vertex
      if (typeof llfColorIdx === 'number') {
        extendedVertex.color = colors[llfColorIdx]
      }
      return Vertex.fromArxVertex(extendedVertex)
    })

    const textureContainer = textures.find((texture) => {
      return texture.id === textureContainerId
    })

    return new Polygon({
      polygonData,
      flags,
      vertices: extendedVertices as QuadrupleOf<Vertex>,
      normalsCalculated,
      norm: Vector3.fromArxVector3(norm),
      norm2: Vector3.fromArxVector3(norm2),
      texture: textureContainer ? Texture.fromArxTextureContainer(textureContainer) : undefined,
    })
  }

  toArxPolygon() {
    const arxVertices = this.vertices.map((vertex) => {
      return vertex.toArxVertex()
    })

    return {
      ...this.polygonData,
      vertices: arxVertices as QuadrupleOf<ArxVertex>,
      norm: this.norm.toArxVector3(),
      norm2: this.norm.toArxVector3(),
    }
  }

  isQuad() {
    return (this.flags & ArxPolygonFlags.Quad) > 0
  }

  calculateNormals() {
    if (this.normalsCalculated === true) {
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
