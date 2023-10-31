import { Box3 } from 'three'
import { ArxMap } from '@src/ArxMap.js'
import { Texture } from '@src/Texture.js'

export const removePolygonsByTextureWithinBox = (texture: Texture, box: Box3, map: ArxMap) => {
  const numberOfPolygons = map.polygons.length
  for (let i = numberOfPolygons - 1; i > 0; i--) {
    const polygon = map.polygons[i]

    if (!polygon.isWithin(box)) {
      continue
    }

    if (typeof polygon.texture === 'undefined') {
      continue
    }

    if (polygon.texture.equals(texture)) {
      map.polygons.splice(i, 1)
    }
  }
}
