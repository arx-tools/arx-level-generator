import { addScript, createItem, items, markAsUsed, moveTo } from '../../assets/items'
import { getInjections } from '../../scripting'
import { RelativeCoords, RotationVertex3 } from '../../types'

export const createWorm = (pos: RelativeCoords, { a, b, g }: RotationVertex3) => {
  const ref = createItem(items.npc.worm, { name: 'Jimmy' })

  addScript((self) => {
    return `
// component: worm
ON INIT {
  ${getInjections('init', self)}
  ACCEPT
}
    `
  }, ref)

  moveTo(pos, [a, b, g], ref)
  markAsUsed(ref)

  return ref
}
