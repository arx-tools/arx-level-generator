import { Color } from '@src/Color.js'
import { Texture } from '@src/Texture.js'
import { Vector3 } from '@src/Vector3.js'
import { CylinderGeometry, Mesh, MeshBasicMaterial, Vector2 } from 'three'

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

export const createNWCorner = () => {
  const pole = createWoodenPole({ pos: new Vector3(-200, -50, 850) })
  return [pole]
}

export const createSWCorner = () => {
  const pole = createWoodenPole({ pos: new Vector3(-200, -50, 850 - 1700) })
  return [pole]
}

export const createNECorner = () => {
  const pole = createWoodenPole({ pos: new Vector3(-200 + 3100, -50, 850) })
  return [pole]
}

export const createSECorner = () => {
  const pole = createWoodenPole({ pos: new Vector3(-200 + 3100, -50, 850 - 1700) })
  return [pole]
}
