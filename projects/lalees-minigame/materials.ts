import { ArxPolygonFlags } from 'arx-convert/types'
import { Material } from '@src/Material.js'
import { Texture } from '@src/Texture.js'

const TEXTURE_DIR = 'textures'

export const carpet = Material.fromTexture(
  await Texture.fromCustomFile({
    filename: '[fabric]-carpet.jpg',
    sourcePath: TEXTURE_DIR,
  }),
  {
    flags: ArxPolygonFlags.Tiled,
  },
)

export const granite = Material.fromTexture(
  await Texture.fromCustomFile({
    filename: '[stone]-granite.jpg',
    sourcePath: TEXTURE_DIR,
  }),
  {
    flags: ArxPolygonFlags.Tiled,
  },
)

export const woodStripes = Material.fromTexture(
  await Texture.fromCustomFile({
    filename: '[wood]-stripes.jpg',
    sourcePath: TEXTURE_DIR,
  }),
  {
    flags: ArxPolygonFlags.Tiled,
  },
)

export const apartments = await Texture.fromCustomFile({
  filename: 'office-facade.jpg',
  sourcePath: 'projects/city/textures',
})
