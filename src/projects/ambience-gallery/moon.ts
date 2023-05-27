import { MathUtils, Mesh, MeshBasicMaterial, SphereGeometry, Vector2 } from 'three'
import { ArxPolygonFlags } from 'arx-convert/types'
import { Color } from '@src/Color.js'
import { Material } from '@src/Material.js'
import { Texture } from '@src/Texture.js'
import { Vector3 } from '@src/Vector3.js'
import { createLight } from '@tools/createLight.js'
import { scaleUV } from '@tools/mesh/scaleUV.js'
import { translateUV } from '@tools/mesh/translateUV.js'
import { toArxCoordinateSystem } from '@tools/mesh/toArxCoordinateSystem.js'

export const createMoon = ({ position, size }: { position: Vector3; size: number }) => {
  let geometry = new SphereGeometry(size, 10, 10)
  geometry = toArxCoordinateSystem(geometry)

  scaleUV(new Vector2(0.2, 0.2), geometry)
  translateUV(new Vector2(0.7, 0.7), geometry)

  const material = new MeshBasicMaterial({
    color: Color.white.getHex(),
    map: Material.fromTexture(Texture.itemCheese, {
      flags: ArxPolygonFlags.Glow,
    }),
  })

  const mesh = new Mesh(geometry, material)
  mesh.translateX(position.x - 100)
  mesh.translateY(position.y + 100)
  mesh.translateZ(position.z - 50)
  mesh.rotateY(MathUtils.degToRad(180))

  const light = createLight({
    position,
    color: Color.white.darken(30),
    fallStart: 200,
    radius: 5000,
  })

  return {
    meshes: [mesh].flat(),
    lights: [light].flat(),
  }
}
