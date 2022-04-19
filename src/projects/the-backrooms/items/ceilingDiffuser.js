import { compose } from 'ramda'
import {
  createItem,
  addScript,
  createRootItem,
  moveTo,
  markAsUsed,
} from '../../../assets/items'
import { useTexture, textures } from '../../../assets/textures'
import { getInjections } from '../../../scripting'

const itemDesc = {
  src: 'fix_inter/ceiling_diffuser/ceiling_diffuser.teo',
  native: true,
}

export const defineCeilingDiffuser = () => {
  useTexture(textures.backrooms.ceilingDiffuser)

  return compose(
    addScript((self) => {
      return `
// component: ceilingDiffuser
ON INIT {
  ${getInjections('init', self)}
  USEMESH "polytrans/polytrans.teo"
  ACCEPT
}

ON INITEND {
  TWEAK SKIN "[stone]_ground_caves_wet05" "backrooms-[metal]-ceiling-air-diffuser"
  ACCEPT
}
      `
    }),
    createRootItem,
  )(itemDesc, {
    name: 'Ceiling Diffuser',
    interactive: false,
    scale: 0.6,
  })
}

export const createCeilingDiffuser = (pos, angle = [0, 0, 0], config = {}) => {
  return compose(
    markAsUsed,
    moveTo(pos, angle),
    addScript((self) => {
      return `
// component: ceilingDiffuser
ON INIT {
  ${getInjections('init', self)}
  ACCEPT
}
      `
    }),
    createItem,
  )(itemDesc, {})
}
