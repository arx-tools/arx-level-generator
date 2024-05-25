import { BoxGeometry, MathUtils, Mesh, MeshBasicMaterial, Vector2 } from 'three'
import { Vector3 } from '@src/Vector3.js'
import { TextureOrMaterial } from '@src/types.js'
import { toArxCoordinateSystem } from '@tools/mesh/toArxCoordinateSystem.js'

export const createBox = ({
  position,
  origin = new Vector2(0, 0),
  size,
  angleY = 0,
  materials,
}: {
  position: Vector3
  /**
   * align the point of rotation on the X/Z axis when angleY is not 0
   * 0/0 = center/center, 1/0 = right/center, -1/0 = left/center, -1/-1 = left/top, 0/1 = center/bottom
   *
   * default value is Vector2(0, 0)
   */
  origin?: Vector2
  size: number | Vector3
  /**
   * default value is 0
   */
  angleY?: number
  /**
   * material face order: left, right, bottom, top, front, back
   */
  materials:
    | TextureOrMaterial
    | [TextureOrMaterial, TextureOrMaterial, TextureOrMaterial, TextureOrMaterial, TextureOrMaterial, TextureOrMaterial]
}) => {
  if (typeof size === 'number') {
    size = new Vector3(size, size, size)
  }

  let geometry = new BoxGeometry(
    size.x,
    size.y,
    size.z,
    Math.ceil(size.x / 100),
    Math.ceil(size.y / 100),
    Math.ceil(size.z / 100),
  )
  geometry = toArxCoordinateSystem(geometry)
  geometry.rotateY(MathUtils.degToRad(180))
  geometry.rotateZ(MathUtils.degToRad(180))
  geometry.translate((size.x / 2) * origin.x, 0, (size.z / 2) * origin.y)
  geometry.rotateY(MathUtils.degToRad(angleY))
  geometry.translate(position.x, position.y, position.z)

  if (Array.isArray(materials)) {
    return new Mesh(geometry, [
      new MeshBasicMaterial({ map: materials[0] }),
      new MeshBasicMaterial({ map: materials[1] }),
      new MeshBasicMaterial({ map: materials[2] }),
      new MeshBasicMaterial({ map: materials[3] }),
      new MeshBasicMaterial({ map: materials[4] }),
      new MeshBasicMaterial({ map: materials[5] }),
    ])
  } else {
    return new Mesh(geometry, new MeshBasicMaterial({ map: materials }))
  }
}
