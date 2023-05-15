import {
  TEXTURE_CUSTOM_SCALE,
  TEXTURE_CUSTOM_UV,
  TEXTURE_FULL_SCALE,
  TEXTURE_QUAD_BOTTOM_LEFT,
  TEXTURE_QUAD_BOTTOM_RIGHT,
  TEXTURE_QUAD_TOP_LEFT,
  TEXTURE_QUAD_TOP_RIGHT,
} from './constants'

export type LootTableEntry = {
  name: string
  weight: number
  variant?: string
}

export type LootTable = LootTableEntry[]

export type MapConfig = {
  origin: AbsoluteCoords
  levelIdx: number
  seed: string
  lootTable: LootTable
  bumpFactor: number
  outputDir?: string
}

export type TextureQuad =
  | typeof TEXTURE_CUSTOM_SCALE
  | typeof TEXTURE_CUSTOM_UV
  | typeof TEXTURE_FULL_SCALE
  | typeof TEXTURE_QUAD_TOP_LEFT
  | typeof TEXTURE_QUAD_TOP_RIGHT
  | typeof TEXTURE_QUAD_BOTTOM_LEFT
  | typeof TEXTURE_QUAD_BOTTOM_RIGHT
