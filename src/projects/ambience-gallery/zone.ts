import { Ambience } from '@src/Ambience.js'
import { Color } from '@src/Color.js'
import { Vector3 } from '@src/Vector3.js'
import { Zone } from '@src/Zone.js'
import { EdgesGeometry, MathUtils, Shape, ShapeGeometry } from 'three'

export const createZone = (pos: Vector3, size: Vector3, ambience: Ambience, color?: Color) => {
  const shape = new Shape()
  shape.lineTo(size.x, 0)
  shape.lineTo(size.x, size.z)
  shape.lineTo(0, size.z)

  const geometry = new ShapeGeometry(shape)
  const edge = new EdgesGeometry(geometry)
  edge.rotateX(MathUtils.degToRad(90))
  edge.translate(pos.x, pos.y, pos.z)

  return Zone.fromThreejsGeometry(edge, {
    name: ambience.name,
    height: size.y,
    ambience,
    backgroundColor: color,
  })
}
