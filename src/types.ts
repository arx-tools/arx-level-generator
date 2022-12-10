import { ArxColor } from 'arx-level-json-converter/dist/common/Color'
import { ArxFTS } from 'arx-level-json-converter/dist/fts/FTS'
import { ArxPolygon } from 'arx-level-json-converter/dist/fts/Polygon'
import { ArxVertex } from 'arx-level-json-converter/dist/fts/Vertex'

export type ExtendedArxVertex = ArxVertex & {
  color?: ArxColor
}

export type ExtendedArxPolygon = Omit<ArxPolygon, 'vertices'> & {
  vertices: [ExtendedArxVertex, ExtendedArxVertex, ExtendedArxVertex, ExtendedArxVertex]
  normalsCalculated?: boolean
}

export type ExtendedArxFTS = Omit<ArxFTS, 'polygons'> & {
  polygons: ExtendedArxPolygon[]
}
