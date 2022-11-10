import { addScript, createItem, InjectableProps, items, markAsUsed, moveTo } from '../../../assets/items'
import { declare, getInjections } from '../../../scripting'
import { RotationVector3 } from '../../../types'

type StoneSpecificProps = {
  weight?: number
}

export const createStone = (
  pos,
  angle: RotationVector3 = [0, 0, 0],
  { weight, ...props }: InjectableProps & StoneSpecificProps = {},
) => {
  const ref = createItem(items.misc.stone, {
    name: `a stone (weight = ${weight ?? 1} kg)`,
    ...props,
  })

  declare('public int', 'weight', weight ?? 1, ref)

  addScript((self) => {
    return `
// component: stone
ON INIT {
  ${getInjections('init', self)}
  ACCEPT
}
    `
  }, ref)

  // Arx Libertatis TODOs:
  //  - scale is not making the hitbox scale correctly
  //  - can the item move slower when heavier? (SET_WEIGHT purpose?)

  moveTo({ type: 'relative', coords: pos }, angle, ref)
  markAsUsed(ref)

  return ref
}
