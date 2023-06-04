import { BoxGeometry, CylinderGeometry, MathUtils, Mesh, MeshBasicMaterial } from 'three'
import { Texture } from '@src/Texture.js'
import { Vector3 } from '@src/Vector3.js'
import { toArxCoordinateSystem } from '@tools/mesh/toArxCoordinateSystem.js'

export const createTable = ({ position }: { position: Vector3 }) => {
  const tableTopMaterial = new MeshBasicMaterial({
    map: Texture.l4DwarfWoodBoard02,
  })

  const tableLegMaterial = new MeshBasicMaterial({
    map: Texture.l2TrollWoodPillar08,
  })

  const tableHeight = 100

  const tableTopSize = new Vector3(300, 6, 100)
  let tableTopGeometry = new BoxGeometry(
    tableTopSize.x,
    tableTopSize.y,
    tableTopSize.z,
    Math.ceil(tableTopSize.x / 100),
    Math.ceil(tableTopSize.y / 100),
    Math.ceil(tableTopSize.z / 100),
  )
  tableTopGeometry = toArxCoordinateSystem(tableTopGeometry)

  const tableTop = new Mesh(tableTopGeometry, tableTopMaterial)
  tableTop.translateX(position.x)
  tableTop.translateY(position.y + tableTopSize.y / 2)
  tableTop.translateZ(position.z)
  tableTop.rotateY(MathUtils.degToRad(90))

  let tableLegGeometry = new CylinderGeometry(5, 5, tableHeight - tableTopSize.y, 5, 1)
  tableLegGeometry = toArxCoordinateSystem(tableLegGeometry)

  const tableLeg1 = new Mesh(tableLegGeometry.clone(), tableLegMaterial)
  tableLeg1.translateX(position.x + 30)
  tableLeg1.translateY(position.y + (tableHeight - tableTopSize.y) / 2 + tableTopSize.y)
  tableLeg1.translateZ(position.z + 110)
  tableLeg1.rotateY(MathUtils.degToRad(90))

  const tableLeg2 = new Mesh(tableLegGeometry.clone(), tableLegMaterial)
  tableLeg2.translateX(position.x + 30)
  tableLeg2.translateY(position.y + (tableHeight - tableTopSize.y) / 2 + tableTopSize.y)
  tableLeg2.translateZ(position.z - 110)
  tableLeg2.rotateY(MathUtils.degToRad(90))

  const tableLeg3 = new Mesh(tableLegGeometry.clone(), tableLegMaterial)
  tableLeg3.translateX(position.x - 30)
  tableLeg3.translateY(position.y + (tableHeight - tableTopSize.y) / 2 + tableTopSize.y)
  tableLeg3.translateZ(position.z + 110)
  tableLeg3.rotateY(MathUtils.degToRad(90))

  const tableLeg4 = new Mesh(tableLegGeometry.clone(), tableLegMaterial)
  tableLeg4.translateX(position.x - 30)
  tableLeg4.translateY(position.y + (tableHeight - tableTopSize.y) / 2 + tableTopSize.y)
  tableLeg4.translateZ(position.z - 110)
  tableLeg4.rotateY(MathUtils.degToRad(90))

  return {
    meshes: [tableTop, tableLeg1, tableLeg2, tableLeg3, tableLeg4],
  }
}
