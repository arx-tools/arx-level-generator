import { ArxPolygonFlags } from 'arx-convert/types'
import { ArxMap } from '@src/ArxMap.js'

export const makePolygonsDoubleSided = (map: ArxMap) => {
  const numberOfPolygons = map.polygons.length
  for (let i = numberOfPolygons - 1; i > 0; i--) {
    const polygon = map.polygons[i]
    polygon.flags = polygon.flags | ArxPolygonFlags.DoubleSided
  }
}
