import { ArxMap } from '@src/ArxMap.js'
import { Texture } from '@src/Texture.js'
import { any } from '@src/faux-ramda.js'

export const removePolygonsByTextures = (textures: Texture[], map: ArxMap) => {
  if (textures.length === 0) {
    return
  }

  const numberOfPolygons = map.polygons.length
  for (let i = numberOfPolygons - 1; i > 0; i--) {
    const polygon = map.polygons[i]

    if (typeof polygon.texture !== 'undefined') {
      continue
    }

    if (any((texture) => (polygon.texture as Texture).equals(texture), textures)) {
      map.polygons.splice(i, 1)
    }
  }
}
