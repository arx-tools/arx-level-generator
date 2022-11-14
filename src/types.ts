import {
  TEXTURE_CUSTOM_SCALE,
  TEXTURE_CUSTOM_UV,
  TEXTURE_FULL_SCALE,
  TEXTURE_QUAD_BOTTOM_LEFT,
  TEXTURE_QUAD_BOTTOM_RIGHT,
  TEXTURE_QUAD_TOP_LEFT,
  TEXTURE_QUAD_TOP_RIGHT,
} from './constants'

export type Vector3 = [number, number, number]

export type RotationVector3 = [number, number, number]

export type PosVertex3 = {
  x: number
  y: number
  z: number
  u: number
  v: number
  llfColorIdx?: number
  modified?: boolean
}

export type Polygon = [PosVertex3, PosVertex3, PosVertex3, PosVertex3]

export type Vertex3 = {
  x: number
  y: number
  z: number
}

export type NullableVertex3 = {
  x: number | null
  y: number | null
  z: number | null
}

export type RotationVertex3 = {
  a: number
  b: number
  g: number
}

export type AbsoluteCoords = {
  type: 'absolute'
  coords: Vector3
}

export type RelativeCoords = {
  type: 'relative'
  coords: Vector3
}

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

export type RgbaBytes = {
  r: number
  g: number
  b: number
  a: number
}

export type UV = {
  u: number
  v: number
}

export type UVQuad = [UV, UV, UV, UV]

export type TextureQuad =
  | typeof TEXTURE_CUSTOM_SCALE
  | typeof TEXTURE_CUSTOM_UV
  | typeof TEXTURE_FULL_SCALE
  | typeof TEXTURE_QUAD_TOP_LEFT
  | typeof TEXTURE_QUAD_TOP_RIGHT
  | typeof TEXTURE_QUAD_BOTTOM_LEFT
  | typeof TEXTURE_QUAD_BOTTOM_RIGHT
