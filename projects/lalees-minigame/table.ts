import { CylinderGeometry, MathUtils, Mesh, MeshBasicMaterial } from 'three'
import { Material } from '@src/Material.js'
import { Texture } from '@src/Texture.js'
import { Vector3 } from '@src/Vector3.js'
import { createBox } from '@prefabs/mesh/box.js'
import { toArxCoordinateSystem } from '@tools/mesh/toArxCoordinateSystem.js'

export const createTable = ({ position, angleY = 0 }: { position: Vector3; angleY?: number }) => {
  const tableLegMaterial = new MeshBasicMaterial({
    map: Texture.l2TrollWoodPillar08,
  })

  const tableHeight = 80

  const tableTop = createBox({
    position: position.clone().add(new Vector3(0, 3, 0)),
    size: new Vector3(300, 6, 100),
    angleY,
    materials: Material.fromTexture(Texture.l4DwarfWoodBoard02),
  })

  let tableLegGeometry = new CylinderGeometry(5, 5, tableHeight - 6, 5, 1)
  tableLegGeometry = toArxCoordinateSystem(tableLegGeometry)

  const tableLeg1Geometry = tableLegGeometry.clone()
  tableLeg1Geometry.translate(30, (tableHeight + 6) / 2, 110)
  tableLeg1Geometry.rotateY(MathUtils.degToRad(90 + angleY))
  const tableLeg1 = new Mesh(tableLeg1Geometry, tableLegMaterial)
  tableLeg1.translateX(position.x)
  tableLeg1.translateY(position.y)
  tableLeg1.translateZ(position.z)

  const tableLeg2Geometry = tableLegGeometry.clone()
  tableLeg2Geometry.translate(30, (tableHeight + 6) / 2, -110)
  tableLeg2Geometry.rotateY(MathUtils.degToRad(90 + angleY))
  const tableLeg2 = new Mesh(tableLeg2Geometry, tableLegMaterial)
  tableLeg2.translateX(position.x)
  tableLeg2.translateY(position.y)
  tableLeg2.translateZ(position.z)

  const tableLeg3Geometry = tableLegGeometry.clone()
  tableLeg3Geometry.translate(-30, (tableHeight + 6) / 2, 110)
  tableLeg3Geometry.rotateY(MathUtils.degToRad(90 + angleY))
  const tableLeg3 = new Mesh(tableLeg3Geometry, tableLegMaterial)
  tableLeg3.translateX(position.x)
  tableLeg3.translateY(position.y)
  tableLeg3.translateZ(position.z)

  const tableLeg4Geometry = tableLegGeometry.clone()
  tableLeg4Geometry.translate(-30, (tableHeight + 6) / 2, -110)
  tableLeg4Geometry.rotateY(MathUtils.degToRad(90 + angleY))
  const tableLeg4 = new Mesh(tableLeg4Geometry, tableLegMaterial)
  tableLeg4.translateX(position.x)
  tableLeg4.translateY(position.y)
  tableLeg4.translateZ(position.z)

  return {
    meshes: [tableTop, tableLeg1, tableLeg2, tableLeg3, tableLeg4],
  }
}
