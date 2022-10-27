import { addScript, createItem, items, markAsUsed, moveTo } from '../../../assets/items'
import { getInjections } from '../../../scripting'

export const createFern = (pos, angle = [0, 0, 0], props = {}) => {
  const ref = createItem(items.plants.fern, {
    ...props,
  })

  addScript((self) => {
    return `
// component: fern
ON INIT {
${getInjections('init', self)}
ACCEPT
}
    `
  }, ref)

  moveTo({ type: 'relative', coords: pos }, angle, ref)
  markAsUsed(ref)

  return ref
}
