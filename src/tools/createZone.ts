import { Expand } from 'arx-convert/utils'
import { EdgesGeometry, MathUtils, Shape, ShapeGeometry } from 'three'
import { Vector3 } from '@src/Vector3.js'
import { Zone, ZoneConstructorProps } from '@src/Zone.js'

export const createZone = (
  props: Expand<Omit<ZoneConstructorProps, 'points' | 'height'> & { position?: Vector3; size?: Vector3 }>,
) => {
  const size = props.size ?? new Vector3(100, Infinity, 100)
  const position = props.position ?? new Vector3(0, 0, 0)

  const shape = new Shape()
  shape.lineTo(size.x, 0)
  shape.lineTo(size.x, size.z)
  shape.lineTo(0, size.z)

  const geometry = new ShapeGeometry(shape)
  const edge = new EdgesGeometry(geometry)
  edge.rotateX(MathUtils.degToRad(90))
  edge.translate(position.x - size.x / 2, position.y, position.z - size.z / 2)

  return Zone.fromThreejsGeometry(edge, {
    height: size.y,
    ...props,
  })
}
