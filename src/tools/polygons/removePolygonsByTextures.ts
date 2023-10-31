import { Polygons } from '@src/Polygons.js'
import { Texture } from '@src/Texture.js'

export const removePolygonsByTextures = (textures: Texture[], polygons: Polygons) => {
  if (textures.length === 0) {
    return
  }

  const numberOfPolygons = polygons.length
  for (let i = numberOfPolygons - 1; i > 0; i--) {
    const polygon = polygons[i]

    if (polygon.texture?.equalsAny(textures)) {
      polygons.splice(i, 1)
    }
  }
}
