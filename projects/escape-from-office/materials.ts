import { ArxPolygonFlags } from 'arx-convert/types'
import { Material } from '@src/Material.js'
import { Texture } from '@src/Texture.js'

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
    filename: '[stone]-office-ceiling-tile.jpg',
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
