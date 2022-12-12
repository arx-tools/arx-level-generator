import { ArxColor } from 'arx-level-json-converter/dist/common/Color'
import { ArxVertex } from 'arx-level-json-converter/dist/fts/Vertex'

export type ArxVertexWithColor = ArxVertex & {
  color?: ArxColor
}
