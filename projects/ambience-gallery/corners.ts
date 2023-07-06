import { CylinderGeometry, Mesh, MeshBasicMaterial } from 'three'
import { Color } from '@src/Color.js'
import { Texture } from '@src/Texture.js'
import { Vector3 } from '@src/Vector3.js'
import { createLight } from '@tools/createLight.js'
import { toArxCoordinateSystem } from '@tools/mesh/toArxCoordinateSystem.js'

const createWoodenPole = ({ position }: { position: Vector3 }) => {
  const radius = 20
  const height = 600
  let geometry = new CylinderGeometry(radius, radius, height, 7, height / 100)
  geometry = toArxCoordinateSystem(geometry)

  const material = new MeshBasicMaterial({
    map: Texture.l2TrollWoodPillar08,
  })

  const pole = new Mesh(geometry, material)
  pole.translateX(position.x)
  pole.translateY(position.y - height / 2)
  pole.translateZ(position.z)

  return pole
}

export const createNWCorner = async () => {
  const pos = new Vector3(-200, 50, 850)
  const pole = createWoodenPole({ position: pos })
  const poleLight = createLight({
    position: pos.clone().add(new Vector3(100, -300, -60)),
    radius: 400,
    intensity: 0.4,
    color: Color.fromCSS('white'),
  })

  return {
    meshes: [pole].flat(),
    lights: [poleLight].flat(),
  }
}

export const createSWCorner = async () => {
  const pos = new Vector3(-200, 50, 850 - 1700)
  const pole = createWoodenPole({ position: pos })
  const poleLight = createLight({
    position: pos.clone().add(new Vector3(100, -300, 60)),
    radius: 400,
    intensity: 0.3,
    color: Color.fromCSS('white'),
  })

  return {
    meshes: [pole].flat(),
    lights: [poleLight].flat(),
  }
}

export const createNECorner = async () => {
  const pos = new Vector3(-200 + 3100, 50, 850)
  const pole = createWoodenPole({ position: pos })
  const poleLight = createLight({
    position: pos.clone().add(new Vector3(-100, -300, -60)),
    radius: 400,
    intensity: 0.3,
    color: Color.fromCSS('white'),
  })

  return {
    meshes: [pole].flat(),
    lights: [poleLight].flat(),
  }
}

export const createSECorner = async () => {
  const pos = new Vector3(-200 + 3100, 50, 850 - 1700)
  const pole = createWoodenPole({ position: pos })
  const poleLight = createLight({
    position: pos.clone().add(new Vector3(-100, -300, 60)),
    radius: 400,
    intensity: 0.3,
    color: Color.fromCSS('white'),
  })

  return {
    meshes: [pole].flat(),
    lights: [poleLight].flat(),
  }
}
