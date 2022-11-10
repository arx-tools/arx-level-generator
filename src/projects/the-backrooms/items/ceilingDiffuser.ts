import {
  createItem,
  addScript,
  createRootItem,
  moveTo,
  markAsUsed,
  ItemDefinition,
  InjectableProps,
} from '../../../assets/items'
import { useTexture, textures } from '../../../assets/textures'
import { getInjections } from '../../../scripting'
import { RotationVector3 } from '../../../types'

const ceilingDiffuserDesc: ItemDefinition = {
  src: 'fix_inter/ceiling_diffuser/ceiling_diffuser.teo',
  native: true,
}

export const defineCeilingDiffuser = () => {
  useTexture(textures.backrooms.ceilingDiffuser)

  const ref = createRootItem(ceilingDiffuserDesc, {
    interactive: false,
    scale: 0.6,
    mesh: 'polytrans/polytrans.teo',
  })

  addScript((self) => {
    return `
// component: ceilingDiffuser
ON INIT {
  ${getInjections('init', self)}
  ACCEPT
}

ON INITEND {
  ${getInjections('initend', self)}
  TWEAK SKIN "[stone]_ground_caves_wet05" "backrooms-[metal]-ceiling-air-diffuser"
  ACCEPT
}
    `
  }, ref)

  return ref
}

type CeilingDiffuserSpecificProps = {}

export const createCeilingDiffuser = (
  pos,
  angle: RotationVector3 = [0, 0, 0],
  config: InjectableProps & CeilingDiffuserSpecificProps = {},
) => {
  const ref = createItem(ceilingDiffuserDesc, { ...config })

  addScript((self) => {
    return `
// component: ceilingDiffuser
ON INIT {
  ${getInjections('init', self)}
  ACCEPT
}
    `
  }, ref)

  moveTo({ type: 'relative', coords: pos }, angle, ref)
  markAsUsed(ref)

  return ref
}
