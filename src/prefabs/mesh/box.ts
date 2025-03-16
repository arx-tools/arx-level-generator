import { BoxGeometry, MathUtils, Mesh, MeshBasicMaterial, Vector2 } from 'three'
import { Vector3 } from '@src/Vector3.js'
import type { TextureOrMaterial } from '@src/types.js'
import { toArxCoordinateSystem } from '@tools/mesh/toArxCoordinateSystem.js'
import { Texture } from '@src/Texture.js'

type createBoxProps = {
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
   * texture face order: left, right, bottom, top, front, back
   *
   * default value is Texture.missingTexture
   */
  texture?:
    | TextureOrMaterial
    | [TextureOrMaterial, TextureOrMaterial, TextureOrMaterial, TextureOrMaterial, TextureOrMaterial, TextureOrMaterial]
}

export function createBox({
  position,
  origin = new Vector2(0, 0),
  size,
  angleY = 0,
  texture = Texture.missingTexture,
}: createBoxProps): Mesh {
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

  if (Array.isArray(texture)) {
    return new Mesh(geometry, [
      new MeshBasicMaterial({ map: texture[0] }),
      new MeshBasicMaterial({ map: texture[1] }),
      new MeshBasicMaterial({ map: texture[2] }),
      new MeshBasicMaterial({ map: texture[3] }),
      new MeshBasicMaterial({ map: texture[4] }),
      new MeshBasicMaterial({ map: texture[5] }),
    ])
  }

  return new Mesh(geometry, new MeshBasicMaterial({ map: texture }))
}
