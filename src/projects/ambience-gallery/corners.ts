import { Color } from '@src/Color.js'
import { Rotation } from '@src/Rotation.js'
import { Texture } from '@src/Texture.js'
import { Vector3 } from '@src/Vector3.js'
import { createLight } from '@tools/createLight.js'
import { loadOBJ } from '@tools/mesh/loadOBJ.js'
import { CylinderGeometry, MathUtils, Mesh, MeshBasicMaterial, Vector2 } from 'three'

const createWoodenPole = ({ position }: { position: Vector3 }) => {
  const radius = 20
  const height = 600
  const geometry = new CylinderGeometry(radius, radius, height, 7, height / 100)

  const material = new MeshBasicMaterial({
    color: Color.white.darken(50).getHex(),
    map: Texture.l2TrollWoodPillar08,
  })

  const pole = new Mesh(geometry, material)
  pole.translateX(position.x)
  pole.translateY(position.y + height / 2)
  pole.translateZ(position.z)

  return pole
}

const createMegaphone = async ({ position, rotation }: { position: Vector3; rotation?: Rotation }) => {
  return loadOBJ('models/megaphone/megaphone', {
    position,
    rotation,
    scale: 20,
  })
}

export const createNWCorner = async () => {
  const pos = new Vector3(-200, -50, 850)
  const pole = createWoodenPole({ position: pos })
  const poleLight = createLight({
    position: pos.clone().add(new Vector3(100, -300, -60)),
    radius: 400,
    intensity: 0.4,
    color: Color.fromCSS('white'),
  })
  const megaphone = await createMegaphone({
    position: pos.clone().add(new Vector3(50, 550, -30)),
    rotation: new Rotation(MathUtils.degToRad(-20), MathUtils.degToRad(-60), 0),
  })

  return {
    meshes: [pole, megaphone].flat(),
    lights: [poleLight].flat(),
  }
}

export const createSWCorner = async () => {
  const pos = new Vector3(-200, -50, 850 - 1700)
  const pole = createWoodenPole({ position: pos })
  const poleLight = createLight({
    position: pos.clone().add(new Vector3(100, -300, 60)),
    radius: 400,
    intensity: 0.3,
    color: Color.fromCSS('white'),
  })
  const megaphone = await createMegaphone({
    position: pos.clone().add(new Vector3(50, 550, 30)),
    rotation: new Rotation(MathUtils.degToRad(-20), MathUtils.degToRad(-180 + 60), 0),
  })

  return {
    meshes: [pole, megaphone].flat(),
    lights: [poleLight].flat(),
  }
}

export const createNECorner = async () => {
  const pos = new Vector3(-200 + 3100, -50, 850)
  const pole = createWoodenPole({ position: pos })
  const poleLight = createLight({
    position: pos.clone().add(new Vector3(-100, -300, -60)),
    radius: 400,
    intensity: 0.3,
    color: Color.fromCSS('white'),
  })
  const megaphone = await createMegaphone({
    position: pos.clone().add(new Vector3(-50, 550, -30)),
    rotation: new Rotation(MathUtils.degToRad(-20), MathUtils.degToRad(60), 0),
  })

  return {
    meshes: [pole, megaphone].flat(),
    lights: [poleLight].flat(),
  }
}

export const createSECorner = async () => {
  const pos = new Vector3(-200 + 3100, -50, 850 - 1700)
  const pole = createWoodenPole({ position: pos })
  const poleLight = createLight({
    position: pos.clone().add(new Vector3(-100, -300, 60)),
    radius: 400,
    intensity: 0.3,
    color: Color.fromCSS('white'),
  })
  const megaphone = await createMegaphone({
    position: pos.clone().add(new Vector3(-50, 550, 30)),
    rotation: new Rotation(MathUtils.degToRad(-20), MathUtils.degToRad(180 - 60), 0),
  })

  return {
    meshes: [pole, megaphone].flat(),
    lights: [poleLight].flat(),
  }
}
