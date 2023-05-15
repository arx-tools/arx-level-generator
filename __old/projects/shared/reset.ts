import { addDependencyAs, ItemRef } from '../../assets/items'

export const useWillowModifiedFont = (anyItemRef: ItemRef) => {
  ;['arx.ttf', 'arx_base.ttf', 'arx_default.ttf', 'arx_russian.ttf'].forEach((filename) => {
    addDependencyAs(`reset/font/willow-modified/${filename}`, `misc/${filename}`, anyItemRef)
  })
}
