import { Color } from '@src/Color.js'
import { applyTransformations } from '@src/helpers.js'
import { Texture } from '@src/Texture.js'
import { Vector3 } from '@src/Vector3.js'
import { scaleUV } from '@tools/mesh/scaleUV.js'
import { ExtrudeGeometry, MathUtils, Mesh, MeshBasicMaterial, Shape, Vector2 } from 'three'

export const createNWCorner = () => {
  const size = new Vector3(50, 400, 50)

  const extrudeSettings = {
    steps: size.y / 100,
    depth: size.y,
    bevelEnabled: false,
    bevelThickness: 0,
    bevelSize: 0,
    bevelOffset: 0,
    bevelSegments: 0,
  }

  const shape = new Shape()
  shape.lineTo(size.x - extrudeSettings.bevelSize * 2, 0)
  shape.lineTo(size.x - extrudeSettings.bevelSize * 2, size.z - extrudeSettings.bevelSize * 2)
  shape.lineTo(0, size.z - extrudeSettings.bevelSize * 2)

  const material = new MeshBasicMaterial({
    color: Color.white.darken(50).getHex(),
    map: Texture.stoneHumanAkbaa2F,
  })

  const geometry = new ExtrudeGeometry(shape, extrudeSettings)

  // TODO: remove vectors #0, #1, #2 and #3 (top and bottom 2 triangles)

  scaleUV(new Vector2(0.5 / size.x, 0.5 / size.x), geometry)

  const pos = new Vector3(-200 - size.x / 2, -50, 800 + size.z / 2 + 50)

  const mesh = new Mesh(geometry.clone(), material)
  mesh.translateX(pos.x + extrudeSettings.bevelSize)
  mesh.translateY(pos.y)
  mesh.translateZ(pos.z + extrudeSettings.bevelSize)
  mesh.rotateX(MathUtils.degToRad(-90))
  return mesh
}

export const createSWCorner = () => {
  const mesh = createNWCorner()
  applyTransformations(mesh)
  mesh.translateZ(-1600 - 100)
  return mesh
}

export const createNECorner = () => {
  const mesh = createNWCorner()
  applyTransformations(mesh)
  mesh.translateX(3100)
  return mesh
}

export const createSECorner = () => {
  const mesh = createNWCorner()
  applyTransformations(mesh)
  mesh.translateZ(-1600 - 100)
  mesh.translateX(3100)
  return mesh
}
