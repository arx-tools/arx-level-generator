import { Texture } from '@src/Texture.js'

const TEXTURE_DIR = 'textures'

export const fakeWoodTiles = Texture.fromCustomFile({
  sourcePath: TEXTURE_DIR,
  filename: '[wood]-fake-floor.jpg',
})

export const officeCeiling = Texture.fromCustomFile({
  sourcePath: TEXTURE_DIR,
  filename: '[stone]-offic-ceiling-tile.jpg',
})

export const officeWalls = Texture.fromCustomFile({
  sourcePath: TEXTURE_DIR,
  filename: '[stone]-concrete.jpg',
})
