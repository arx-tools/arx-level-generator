import { addScript, createItem, InjectableProps, items, markAsUsed, moveTo } from '../../../assets/items'
import { getInjections } from '../../../scripting'
import { RelativeCoords } from '../../../types'
import { ArxRotation } from 'arx-level-json-converter/types/binary/BinaryIO'

export const createFern = (
  pos: RelativeCoords,
  angle: ArxRotation = { a: 0, b: 0, g: 0 },
  props: InjectableProps = {},
) => {
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

  moveTo(pos, angle, ref)
  markAsUsed(ref)

  return ref
}
