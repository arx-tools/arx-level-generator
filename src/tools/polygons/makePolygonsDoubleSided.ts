import { ArxPolygonFlags } from 'arx-convert/types'
import { Polygons } from '@src/Polygons.js'

export const makePolygonsDoubleSided = (polygons: Polygons) => {
  const numberOfPolygons = polygons.length
  for (let i = numberOfPolygons - 1; i > 0; i--) {
    const polygon = polygons[i]
    polygon.flags = polygon.flags | ArxPolygonFlags.DoubleSided
  }
}
