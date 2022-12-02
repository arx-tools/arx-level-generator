import { Vector3 } from '../types'
import { items, moveTo, createItem, addScript, ItemRef } from '../assets/items'
import { getInjections, declare } from '../scripting'
import { ArxRotation } from 'arx-level-json-converter/types/binary/BinaryIO'

// source: https://wiki.arx-libertatis.org/Category:Runes
type Rune =
  | 'aam'
  | 'cetrius'
  | 'comunicatum'
  | 'cosum'
  | 'folgora'
  | 'fridd'
  | 'kaom'
  | 'mega'
  | 'morte'
  | 'movis'
  | 'nhi'
  | 'rhaa'
  | 'spacium'
  | 'stregum'
  | 'taar'
  | 'tempus'
  | 'tera'
  | 'vista'
  | 'vitae'
  | 'yok'

export const createRune = (
  runeName: Rune,
  pos: Vector3 | null = null,
  angle: ArxRotation = { a: 0, b: 0, g: 0 },
  onEquipTarget?: ItemRef,
) => {
  const ref = createItem(items.magic.rune)

  declare('string', 'rune_name', runeName, ref)

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
  }, ref)

  if (pos !== null) {
    moveTo({ type: 'relative', coords: pos }, angle, ref)
  }

  return ref
}
