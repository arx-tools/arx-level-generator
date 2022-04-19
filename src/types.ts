export type Vec3 = [number, number, number]

export type AbsoluteCoords = {
  type: 'absolute'
  coords: Vec3
}

export type RelativeCoords = {
  type: 'relative'
  coords: Vec3
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
