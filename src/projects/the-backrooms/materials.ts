import { Texture } from '@src/Texture'

const TEXTURE_DIR = 'projects/the-backrooms/textures'

export const carpet = Texture.fromCustomFile({
  sourcePath: TEXTURE_DIR,
  filename: 'backrooms-[fabric]-carpet-dirty.jpg',
})

export const wallpaper = Texture.fromCustomFile({
  sourcePath: TEXTURE_DIR,
  filename: 'backrooms-[stone]-wall.jpg',
})

export const wallpaperDotted = Texture.fromCustomFile({
  sourcePath: TEXTURE_DIR,
  filename: 'backrooms-[stone]-wall2.jpg',
})

export const ceilingTile = Texture.fromCustomFile({
  sourcePath: TEXTURE_DIR,
  filename: 'backrooms-[stone]-ceiling-tile.jpg',
})

export const mold = Texture.fromCustomFile({
  sourcePath: TEXTURE_DIR,
  filename: 'mold-edge.jpg',
})

export const whiteMosaicTiles = Texture.fromCustomFile({
  sourcePath: TEXTURE_DIR,
  filename: 'pool-room-white-mosaic-tile.jpg',
})
