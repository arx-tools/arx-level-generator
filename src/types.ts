import { ArxColor } from 'arx-level-json-converter/dist/common/Color'
import { ArxVertex } from 'arx-level-json-converter/dist/fts/Vertex'

export type ArxVertexWithColor = ArxVertex & {
  color?: ArxColor
}

export type OriginalLevel =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20
  | 21
  | 22
  | 23
