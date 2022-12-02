import { createItem, items, moveTo, markAsUsed } from '../../../assets/items'
import { RelativeCoords } from '../../../types'

export const createFishSpawn = (pos: RelativeCoords) => {
  const ref = createItem(items.fishSpawn)

  moveTo(pos, { a: 0, b: 0, g: 0 }, ref)
  markAsUsed(ref)

  return ref
}
