import { Color } from '@src/Color.js'
import { Rotation } from '@src/Rotation.js'
import { Texture } from '@src/Texture.js'
import { Vector3 } from '@src/Vector3.js'
import { loadOBJ } from '@tools/mesh/loadOBJ.js'
import { CylinderGeometry, MathUtils, Mesh, MeshBasicMaterial, Vector2 } from 'three'

const createWoodenPole = ({ pos }: { pos: Vector3 }) => {
  const radius = 20
  const height = 600
  const geometry = new CylinderGeometry(radius, radius, height, 7, height / 100)

  const material = new MeshBasicMaterial({
    color: Color.white.darken(50).getHex(),
    map: Texture.l2TrollWoodPillar08,
  })

  const pole = new Mesh(geometry, material)
  pole.translateX(pos.x)
  pole.translateY(pos.y + height / 2)
  pole.translateZ(pos.z)

  return pole
}

const createMegaphone = async ({ pos, rotation }: { pos: Vector3; rotation?: Rotation }) => {
  return loadOBJ('models/megaphone/megaphone', {
    position: pos,
    scale: 20,
    rotation,
  })
}

export const createNWCorner = async () => {
  const pos = new Vector3(-200, -50, 850)
  const pole = createWoodenPole({ pos })
  const megaphone = await createMegaphone({
    pos: pos.clone().add(new Vector3(50, 550, -30)),
    rotation: new Rotation(MathUtils.degToRad(-20), MathUtils.degToRad(-60), 0),
  })
  return [pole, megaphone].flat()
}

export const createSWCorner = async () => {
  const pos = new Vector3(-200, -50, 850 - 1700)
  const pole = createWoodenPole({ pos })
  const megaphone = await createMegaphone({
    pos: pos.clone().add(new Vector3(50, 550, 30)),
    rotation: new Rotation(MathUtils.degToRad(-20), MathUtils.degToRad(-180 + 60), 0),
  })
  return [pole, megaphone].flat()
}

export const createNECorner = async () => {
  const pos = new Vector3(-200 + 3100, -50, 850)
  const pole = createWoodenPole({ pos })
  const megaphone = await createMegaphone({
    pos: pos.clone().add(new Vector3(-50, 550, -30)),
    rotation: new Rotation(MathUtils.degToRad(-20), MathUtils.degToRad(60), 0),
  })
  return [pole, megaphone].flat()
}

export const createSECorner = async () => {
  const pos = new Vector3(-200 + 3100, -50, 850 - 1700)
  const pole = createWoodenPole({ pos })
  const megaphone = await createMegaphone({
    pos: pos.clone().add(new Vector3(-50, 550, 30)),
    rotation: new Rotation(MathUtils.degToRad(-20), MathUtils.degToRad(180 - 60), 0),
  })
  return [pole, megaphone].flat()
}
