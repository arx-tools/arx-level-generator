import { addDependencyAs, addScript, createItem, createRootItem, items, markAsUsed, moveTo } from '../../assets/items'
import { getInjections } from '../../scripting'
import { RelativeCoords } from '../../types'

const cricketDefinition = {
  src: 'fix_inter/crickets/crickets.teo',
  native: true,
}

export const defineCrickets = () => {
  const rootRef = createRootItem(cricketDefinition, {
    name: 'cricket',
    interactive: false,
    mesh: 'polytrans/polytrans.teo',
  })

  addScript((self) => {
    return `
// component: crickets
ON INIT {
  ${getInjections('init', self)}
  PLAY -lip "crickets" // [l] = loop, [i] = unique, [p] = variable pitch
  ACCEPT
}
    `
  }, rootRef)

  addDependencyAs('projects/forest/sounds/crickets.wav', 'sfx/crickets.wav', rootRef)

  return rootRef
}

export const createCrickets = (pos: RelativeCoords) => {
  const ref = createItem(cricketDefinition)

  moveTo(pos, [0, 0, 0], ref)
  markAsUsed(ref)

  return ref
}
