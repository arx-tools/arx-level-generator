import { ArxPolygon } from 'arx-level-json-converter/dist/fts/Polygon'
import { Vector3 } from './Vector3'
import { Vertex } from './Vertex'

export type _Polygon = Omit<ArxPolygon, 'vertices' | 'norm' | 'norm2'> & {
  vertices: [Vertex, Vertex, Vertex, Vertex]
  normalsCalculated: boolean
  norm: Vector3
  norm2: Vector3
}

type PolygonContructorProps = {
  vertices: [Vertex, Vertex, Vertex, Vertex]
  norm: Vector3
  norm2: Vector3
  tex: number
  transval: number
  area: number
  type: number
  room: number
  normalsCalculated: boolean
  normals?: [Vector3, Vector3, Vector3, Vector3]
  paddy?: number
}

export class Polygon {
  vertices: [Vertex, Vertex, Vertex, Vertex]
  norm: Vector3
  norm2: Vector3
  tex: number
  transval: number
  area: number
  type: number
  room: number
  normalsCalculated: boolean
  normals?: [Vector3, Vector3, Vector3, Vector3]
  paddy?: number

  constructor(props: PolygonContructorProps) {
    this.vertices = props.vertices
    this.norm = props.norm
    this.norm2 = props.norm2
    this.tex = props.tex
    this.transval = props.transval
    this.area = props.area
    this.type = props.type
    this.room = props.room
    this.normalsCalculated = props.normalsCalculated
    this.normals = props.normals
    this.paddy = props.paddy
  }
}
