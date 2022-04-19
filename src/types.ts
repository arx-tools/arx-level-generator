export type AbsoluteCoords = [number, number, number]

export type RelativeCoords = [number, number, number]

export type LootTableEntry = any

export type LootTable = LootTableEntry[]

export type MapConfig = {
  origin: AbsoluteCoords
  levelIdx: number
  seed: string
  lootTable: LootTable
  bumpFactor: number
}
