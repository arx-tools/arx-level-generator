import { addScript, createItem, items, markAsUsed, moveTo } from '../../assets/items'
import { getInjections } from '../../scripting'
import { RelativeCoords } from '../../types'
import { ArxRotation } from 'arx-level-json-converter/types/binary/BinaryIO'

export const createWorm = (pos: RelativeCoords, { a, b, g }: ArxRotation) => {
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
