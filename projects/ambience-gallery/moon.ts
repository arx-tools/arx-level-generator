import { ArxPolygonFlags } from 'arx-convert/types'
import { MathUtils, Mesh, MeshBasicMaterial, SphereGeometry, Vector2 } from 'three'
import { Color } from '@src/Color.js'
import { Material } from '@src/Material.js'
import { Texture } from '@src/Texture.js'
import { Vector3 } from '@src/Vector3.js'
import { createLight } from '@tools/createLight.js'
import { scaleUV } from '@tools/mesh/scaleUV.js'
import { toArxCoordinateSystem } from '@tools/mesh/toArxCoordinateSystem.js'
import { translateUV } from '@tools/mesh/translateUV.js'

type createMoonProps = {
  position: Vector3
  size: number
  /**
   * @default new Vector3(-100, 100, -50)
   */
  moonOffset?: Vector3
  /**
   * @default 5000
   */
  lightRadius?: number
}

export const createMoon = ({
  position,
  size,
  moonOffset = new Vector3(-100, 100, -50),
  lightRadius = 5000,
}: createMoonProps) => {
  let geometry = new SphereGeometry(size, 10, 10)
  geometry = toArxCoordinateSystem(geometry)

  scaleUV(new Vector2(0.2, 0.2), geometry)
  translateUV(new Vector2(0.7, 0.7), geometry)

  const material = new MeshBasicMaterial({
    map: Material.fromTexture(Texture.itemCheese, {
      flags: ArxPolygonFlags.Glow,
    }),
  })

  const mesh = new Mesh(geometry, material)
  mesh.translateX(position.x + moonOffset.x)
  mesh.translateY(position.y + moonOffset.y)
  mesh.translateZ(position.z + moonOffset.z)
  mesh.rotateY(MathUtils.degToRad(180))

  const light = createLight({
    position,
    color: Color.white.darken(30),
    fallStart: 200,
    radius: lightRadius,
  })

  return {
    meshes: [mesh].flat(),
    lights: [light].flat(),
  }
}
