import { Material } from '@src/Material.js'
import { Texture } from '@src/Texture.js'
import { ArxPolygonFlags } from 'arx-convert/types'

const TEXTURE_DIR = 'textures'

export const fakeWoodTiles = Material.fromTexture(
  await Texture.fromCustomFile({
    sourcePath: TEXTURE_DIR,
    filename: '[wood]-fake-floor.jpg',
  }),
  {
    flags: ArxPolygonFlags.Tiled,
  },
)

export const officeCeiling = Material.fromTexture(
  await Texture.fromCustomFile({
    sourcePath: TEXTURE_DIR,
    filename: '[stone]-offic-ceiling-tile.jpg',
  }),
  {
    flags: ArxPolygonFlags.Tiled,
  },
)

export const officeWalls = Material.fromTexture(
  await Texture.fromCustomFile({
    sourcePath: TEXTURE_DIR,
    filename: '[stone]-concrete.jpg',
  }),
  {
    flags: ArxPolygonFlags.Tiled,
  },
)
