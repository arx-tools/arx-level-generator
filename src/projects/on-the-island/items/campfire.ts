import { markAsUsed, createItem, items, moveTo } from '../../../assets/items'

export const createCampfire = (pos, angle = [0, 0, 0], props = {}) => {
  const item = createItem(items.misc.campfire, props)
  moveTo({ type: 'relative', coords: pos }, angle, item)
  markAsUsed(item)
  return item
}
