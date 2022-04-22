export type Vector3 = [number, number, number]

export type RotationVector3 = [number, number, number]

export type PosVertex3 = {
  posX: number
  posY: number
  posZ: number
}

export type Vertex3 = {
  x: number
  y: number
  z: number
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
}

export type RgbaBytes = {
  r: number
  g: number
  b: number
  a: number
}

export type FloatRgb = {
  r: number
  g: number
  b: number
}