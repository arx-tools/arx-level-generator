import { Polygons } from '@src/Polygons.js'
import { Texture } from '@src/Texture.js'
import { any } from '@src/faux-ramda.js'

export const removePolygonsByTextures = (textures: Texture[], polygons: Polygons) => {
  if (textures.length === 0) {
    return
  }

  const numberOfPolygons = polygons.length
  for (let i = numberOfPolygons - 1; i > 0; i--) {
    const polygon = polygons[i]

    if (typeof polygon.texture !== 'undefined') {
      continue
    }

    if (any((texture) => (polygon.texture as Texture).equals(texture), textures)) {
      polygons.splice(i, 1)
    }
  }
}
