import { BoxGeometry, CylinderGeometry, MathUtils, Mesh, MeshBasicMaterial } from 'three'
import { Texture } from '@src/Texture.js'
import { Vector3 } from '@src/Vector3.js'
import { toArxCoordinateSystem } from '@tools/mesh/toArxCoordinateSystem.js'

export const createTable = ({ position }: { position: Vector3 }) => {
  const tableToMaterial = new MeshBasicMaterial({
    map: Texture.l4DwarfWoodBoard02,
  })

  const tableLegMaterial = new MeshBasicMaterial({
    map: Texture.l2TrollWoodPillar08,
  })

  const tableTopHeight = 6
  const tableHeight = 100

  let tableTopGeometry = new BoxGeometry(300, 6, tableHeight, 3, 1, 1)
  tableTopGeometry = toArxCoordinateSystem(tableTopGeometry)

  const tableTop = new Mesh(tableTopGeometry, tableToMaterial)
  tableTop.translateX(position.x)
  tableTop.translateY(position.y + 3)
  tableTop.translateZ(position.z)
  tableTop.rotateY(MathUtils.degToRad(90))

  let tableLegGeometry = new CylinderGeometry(5, 5, tableHeight - tableTopHeight, 5, 1)
  tableLegGeometry = toArxCoordinateSystem(tableLegGeometry)

  const tableLeg1 = new Mesh(tableLegGeometry.clone(), tableLegMaterial)
  tableLeg1.translateX(position.x + 30)
  tableLeg1.translateY(position.y + (tableHeight - tableTopHeight) / 2 + tableTopHeight)
  tableLeg1.translateZ(position.z + 110)
  tableLeg1.rotateY(MathUtils.degToRad(90))

  const tableLeg2 = new Mesh(tableLegGeometry.clone(), tableLegMaterial)
  tableLeg2.translateX(position.x + 30)
  tableLeg2.translateY(position.y + (tableHeight - tableTopHeight) / 2 + tableTopHeight)
  tableLeg2.translateZ(position.z - 110)
  tableLeg2.rotateY(MathUtils.degToRad(90))

  const tableLeg3 = new Mesh(tableLegGeometry.clone(), tableLegMaterial)
  tableLeg3.translateX(position.x - 30)
  tableLeg3.translateY(position.y + (tableHeight - tableTopHeight) / 2 + tableTopHeight)
  tableLeg3.translateZ(position.z + 110)
  tableLeg3.rotateY(MathUtils.degToRad(90))

  const tableLeg4 = new Mesh(tableLegGeometry.clone(), tableLegMaterial)
  tableLeg4.translateX(position.x - 30)
  tableLeg4.translateY(position.y + (tableHeight - tableTopHeight) / 2 + tableTopHeight)
  tableLeg4.translateZ(position.z - 110)
  tableLeg4.rotateY(MathUtils.degToRad(90))

  return [tableTop, tableLeg1, tableLeg2, tableLeg3, tableLeg4]
}
