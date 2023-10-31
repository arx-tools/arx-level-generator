import { Polygons } from '@src/Polygons.js'
import { Texture } from '@src/Texture.js'
import { groupSequences } from '@src/faux-ramda.js'

export const removePolygonsByTextures = (textures: Texture[], polygons: Polygons) => {
  if (textures.length === 0) {
    return
  }

  const toBeRemoved: number[] = []
  polygons.forEach((polygon, idx) => {
    if (polygon.texture?.equalsAny(textures)) {
      toBeRemoved.push(idx)
    }
  })

  groupSequences(toBeRemoved)
    .reverse()
    .forEach(([start, size]) => {
      polygons.splice(start, size)
    })
}
