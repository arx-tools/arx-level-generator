import { addScript, createItem, InjectableProps, items, markAsUsed, moveTo } from '../../../assets/items'
import { getInjections } from '../../../scripting'
import { RelativeCoords } from '../../../types'
import { ArxRotation } from 'arx-level-json-converter/types/binary/BinaryIO'

export const createHangingCorpse = (
  pos: RelativeCoords,
  { a, b, g }: ArxRotation = { a: 0, b: 0, g: 0 },
  props: InjectableProps = {},
) => {
  const ref = createItem(items.corpse.hanging, {
    hp: 0,
    ...props,
  })

  addScript((self) => {
    return `
// component: hangingCorpse
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
