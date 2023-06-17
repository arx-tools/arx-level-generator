import { ArxPolygonFlags } from 'arx-convert/types'
import { Material } from '@src/Material.js'
import { Texture } from '@src/Texture.js'

export const TEXTURE_DIR = 'projects/the-backrooms/textures'

export const carpet = Material.fromTexture(
  Texture.fromCustomFile({
    sourcePath: TEXTURE_DIR,
    filename: 'backrooms-[fabric]-carpet-dirty.jpg',
  }),
  {
    flags: ArxPolygonFlags.Tiled,
  },
)

export const wallpaper = Material.fromTexture(
  Texture.fromCustomFile({
    sourcePath: TEXTURE_DIR,
    filename: 'backrooms-[stone]-wall.jpg',
  }),
  {
    flags: ArxPolygonFlags.Tiled,
  },
)

export const wallpaperDotted = Material.fromTexture(
  Texture.fromCustomFile({
    sourcePath: TEXTURE_DIR,
    filename: 'backrooms-[stone]-wall2.jpg',
  }),
  {
    flags: ArxPolygonFlags.Tiled,
  },
)

export const ceilingTile = Material.fromTexture(
  Texture.fromCustomFile({
    sourcePath: TEXTURE_DIR,
    filename: 'backrooms-[stone]-ceiling-tile.jpg',
  }),
  {
    flags: ArxPolygonFlags.Tiled,
  },
)

export const mold = Material.fromTexture(
  Texture.fromCustomFile({
    sourcePath: TEXTURE_DIR,
    filename: 'mold-edge.jpg',
  }),
  {
    flags: ArxPolygonFlags.Tiled,
  },
)

export const whiteMosaicTiles = Material.fromTexture(
  Texture.fromCustomFile({
    sourcePath: TEXTURE_DIR,
    filename: 'pool-room-white-mosaic-tile.jpg',
  }),
  {
    flags: ArxPolygonFlags.Tiled,
  },
)

export const fireExitDoor = Material.fromTexture(
  Texture.fromCustomFile({
    sourcePath: TEXTURE_DIR,
    filename: 'fire-exit-door.bmp',
  }),
  {
    flags: ArxPolygonFlags.Tiled,
  },
)
