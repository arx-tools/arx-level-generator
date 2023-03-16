import { Ambience } from '@src/Ambience'
import { Vector3 } from '@src/Vector3'
import { Zone } from '@src/Zone'
import { EdgesGeometry, MathUtils, Shape, ShapeGeometry } from 'three'

export type ZoneProps = {
  name: string
  ambience: Ambience
}

export const createZone = async (dimensions: Vector3, props: ZoneProps) => {
  const shape = new Shape()
  shape.lineTo(100, 0)
  shape.lineTo(0, 100)
  shape.lineTo(0, 200)
  shape.lineTo(-200, 50)

  const geometry = new ShapeGeometry(shape)
  const edge = new EdgesGeometry(geometry)

  return Zone.fromThreejsGeometry(edge, props)
}
