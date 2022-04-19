import { compose } from 'ramda'
import {
  addScript,
  createItem,
  items,
  markAsUsed,
  moveTo,
} from '../../../assets/items'
import { getInjections } from '../../../scripting'

export const createSmellyFlower = (pos, angle = [0, 0, 0], props = {}) => {
  return compose(
    markAsUsed,
    moveTo(pos, angle),
    addScript((self) => {
      return `
// component: smellyFlower
ON INIT {
  ${getInjections('init', self)}
  ACCEPT
}
      `
    }),
    createItem,
  )(items.plants.fern, {
    name: 'Smelly flower',
    ...props,
  })
}
