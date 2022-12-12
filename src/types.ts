import { ArxColor } from 'arx-level-json-converter/dist/common/Color'
import { ArxPolygon } from 'arx-level-json-converter/dist/fts/Polygon'
import { ArxVertex } from 'arx-level-json-converter/dist/fts/Vertex'
import { Vector3 } from './Vector3'
import { Vertex } from './Vertex'

export type ArxVertexWithColor = ArxVertex & {
  color?: ArxColor
}

export type Polygon = Omit<ArxPolygon, 'vertices' | 'norm' | 'norm2'> & {
  vertices: [Vertex, Vertex, Vertex, Vertex]
  normalsCalculated: boolean
  norm: Vector3
  norm2: Vector3
}
