import { ArxRotation } from 'arx-level-json-converter/types/binary/BinaryIO'
import { addScript, items, createItem, markAsUsed, moveTo, InjectableProps } from '../../../assets/items'
import { getInjections } from '../../../scripting'
import { RelativeCoords } from '../../../types'

type GoblinSpecificProps = {}

export const createGoblin = (
  pos: RelativeCoords,
  angle: ArxRotation = { a: 0, b: 0, g: 0 },
  { ...props }: InjectableProps & GoblinSpecificProps = {},
) => {
  const ref = createItem(items.npc.goblin, {
    ...props,
  })

  addScript((self) => {
    return `
// component: goblin
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
