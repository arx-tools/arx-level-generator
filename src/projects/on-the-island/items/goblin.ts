import { addScript, items, createItem, markAsUsed, moveTo, InjectableProps } from '../../../assets/items'
import { getInjections } from '../../../scripting'
import { RelativeCoords, RotationVector3 } from '../../../types'

type GoblinSpecificProps = {}

export const createGoblin = (
  pos: RelativeCoords,
  angle: RotationVector3 = [0, 0, 0],
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
