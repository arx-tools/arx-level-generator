import { Box3 } from 'three'
import { Polygons } from '@src/Polygons.js'
import { groupSequences } from '@src/faux-ramda.js'

export const removePolygonsWithinBox = (box: Box3, polygons: Polygons) => {
  const toBeRemoved: number[] = []
  polygons.forEach((polygon, idx) => {
    if (polygon.isWithin(box)) {
      toBeRemoved.push(idx)
    }
  })

  groupSequences(toBeRemoved)
    .reverse()
    .forEach(([start, size]) => {
      polygons.splice(start, size)
    })
}
