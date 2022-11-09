import { addScript, createItem, InjectableProps, items, markAsUsed, moveTo } from '../../assets/items'
import { declare, FALSE, getInjections, TRUE } from '../../scripting'
import { RelativeCoords, RotationVertex3 } from '../../types'

type DoorSpecificProps = { isLocked?: boolean }

export const createDoor = (
  pos: RelativeCoords,
  { a, b, g }: RotationVertex3,
  { isLocked, ...props }: InjectableProps & DoorSpecificProps = { isLocked: false },
) => {
  const ref = createItem(items.doors.lightDoor, { name: 'door', ...props })

  declare('bool', 'open', FALSE, ref)
  declare('bool', 'unlock', isLocked ? FALSE : TRUE, ref)

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
