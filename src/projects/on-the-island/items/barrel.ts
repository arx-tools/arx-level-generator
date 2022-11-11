import { createItem, items, ItemRef, addScript, moveTo, markAsUsed } from '../../../assets/items'
import { getInjections, SCRIPT_EOL } from '../../../scripting'
import { RelativeCoords, RotationVector3 } from '../../../types'

export const createBarrel = (pos: RelativeCoords, angle: RotationVector3, contents: ItemRef[] = []) => {
  const ref = createItem(items.containers.barrel, {
    scale: 0.7,
  })

  addScript((self) => {
    return `
// component: barrel
ON INIT {
  ${getInjections('init', self)}

  ${contents.map(({ ref }) => `inventory addfromscene "${ref}"`).join('  ' + SCRIPT_EOL)}

  ACCEPT
}
    `
  }, ref)

  moveTo(pos, angle, ref)
  markAsUsed(ref)

  return ref
}
