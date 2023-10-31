import { Box3 } from 'three'
import { Polygons } from '@src/Polygons.js'

export const removePolygonsWithinBox = (box: Box3, polygons: Polygons) => {
  const numberOfPolygons = polygons.length
  for (let i = numberOfPolygons - 1; i > 0; i--) {
    const polygon = polygons[i]

    if (polygon.isWithin(box)) {
      polygons.splice(i, 1)
    }
  }
}
