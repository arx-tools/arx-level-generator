import { createItem, items, moveTo, markAsUsed, InjectableProps } from '../../../assets/items'
import { RelativeCoords, RotationVector3 } from '../../../types'

type CardSpecificProps = {}

export const createCards = (
  pos: RelativeCoords,
  angle: RotationVector3 = [0, 0, 0],
  { ...props }: InjectableProps & CardSpecificProps = {},
) => {
  const ref = createItem(items.misc.deckOfCards, {
    ...props,
  })

  moveTo(pos, angle, ref)
  markAsUsed(ref)

  return ref
}
