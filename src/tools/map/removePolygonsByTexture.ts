import path from 'node:path'
import { ArxMap } from '@src/ArxMap.js'
import { Texture } from '@src/Texture.js'

export const removePolygonsByTexture = (texture: Texture, map: ArxMap) => {
  const { name: textureFilename } = path.parse(texture.filename.toLowerCase())

  const numberOfPolygons = map.polygons.length
  for (let i = numberOfPolygons - 1; i > 0; i--) {
    const polygon = map.polygons[i]

    if (typeof polygon.texture === 'undefined') {
      continue
    }

    const { name: polygonTextureFilename } = path.parse(polygon.texture.filename.toLowerCase())
    if (polygonTextureFilename === textureFilename) {
      map.polygons.splice(i, 1)
    }
  }
}
