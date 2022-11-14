import { ArxRotation } from 'arx-level-json-converter/types/binary/BinaryIO'
import { createItem, items, moveTo, markAsUsed, InjectableProps } from '../../../assets/items'
import { RelativeCoords } from '../../../types'

type CardSpecificProps = {}

export const createCards = (
  pos: RelativeCoords,
  angle: ArxRotation = { a: 0, b: 0, g: 0 },
  { ...props }: InjectableProps & CardSpecificProps = {},
) => {
  const ref = createItem(items.misc.deckOfCards, {
    ...props,
  })

  moveTo(pos, angle, ref)
  markAsUsed(ref)

  return ref
}
