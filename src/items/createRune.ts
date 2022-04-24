import { RotationVector3, Vector3 } from 'src/types'
import {
  items,
  markAsUsed,
  moveTo,
  createItem,
  addScript,
  ItemRef,
} from '../assets/items'
import { getInjections, declare } from '../scripting'

export const createRune = (
  runeName,
  pos: Vector3 | null = null,
  angle: RotationVector3 = [0, 0, 0],
  onEquipTarget?: ItemRef,
) => {
  const item = createItem(items.magic.rune)

  declare('string', 'rune_name', runeName, item)

  addScript((self) => {
    return `
// component: rune
ON INIT {
  ${getInjections('init', self)}
  ACCEPT
}

${
  onEquipTarget &&
  `
ON INVENTORYUSE {
  SENDEVENT GOT_RUNE ${onEquipTarget.ref} "${runeName}"
  ACCEPT
}
`
}
    `
  }, item)

  if (pos !== null) {
    moveTo({ type: 'relative', coords: pos }, angle, item)
  }

  markAsUsed(item)

  return item
}
