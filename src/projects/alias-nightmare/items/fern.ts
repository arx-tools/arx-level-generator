import { addScript, createItem, InjectableProps, items, markAsUsed, moveTo } from '../../../assets/items'
import { getInjections } from '../../../scripting'
import { RelativeCoords, RotationVertex3 } from '../../../types'

export const createFern = (
  pos: RelativeCoords,
  { a, b, g }: RotationVertex3 = { a: 0, b: 0, g: 0 },
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

  moveTo(pos, [a, b, g], ref)
  markAsUsed(ref)

  return ref
}
