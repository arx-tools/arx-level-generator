import { addScript, createItem, items, markAsUsed, moveTo } from '../../assets/items'
import { declare, FALSE, getInjections, TRUE } from '../../scripting'
import { RelativeCoords, RotationVertex3 } from '../../types'

export const createDoor = (pos: RelativeCoords, { a, b, g }: RotationVertex3) => {
  const ref = createItem(items.doors.lightDoor, { name: 'door' })

  declare('bool', 'open', FALSE, ref)
  declare('bool', 'unlock', TRUE, ref)

  addScript((self) => {
    return `
// component: door
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
