import { Box3 } from 'three'
import { Polygons } from '@src/Polygons.js'
import { groupSequences } from '@src/faux-ramda.js'

export const removePolygonsWithinBox = (box: Box3, polygons: Polygons) => {
  const toBeRemoved: number[] = []

  const numberOfPolygons = polygons.length
  for (let i = numberOfPolygons - 1; i > 0; i--) {
    const polygon = polygons[i]
    if (polygon.isWithin(box)) {
      toBeRemoved.push(i)
    }
  }

  groupSequences(toBeRemoved).forEach(([start, size]) => {
    polygons.splice(start, size)
  })
}
