import { Texture } from '@src/Texture'

const TEXTURE_DIR = 'projects/the-backrooms/textures'

export const carpet = Texture.fromCustomFile({
  sourcePath: TEXTURE_DIR,
  filename: 'backrooms-[fabric]-carpet-dirty.jpg',
  isNative: false,
})

export const wallpaper = Texture.fromCustomFile({
  sourcePath: TEXTURE_DIR,
  filename: 'backrooms-[stone]-wall.jpg',
  isNative: false,
})

export const ceilingTile = Texture.fromCustomFile({
  sourcePath: TEXTURE_DIR,
  filename: 'backrooms-[stone]-ceiling-tile.jpg',
  isNative: false,
})

export const mold = Texture.fromCustomFile({
  sourcePath: TEXTURE_DIR,
  filename: 'mold-edge.jpg',
  isNative: false,
})
