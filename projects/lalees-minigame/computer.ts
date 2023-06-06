import { ArxPolygonFlags } from 'arx-convert/types'
import { BoxGeometry, Mesh, MeshBasicMaterial } from 'three'
import { Material } from '@src/Material.js'
import { Texture } from '@src/Texture.js'
import { Vector3 } from '@src/Vector3.js'
import { toArxCoordinateSystem } from '@tools/mesh/toArxCoordinateSystem.js'

export const createComputer = async ({ position }: { position: Vector3 }) => {
  const computerTextures = {
    monitorScreen: Material.fromTexture(
      await Texture.fromCustomFile({
        filename: 'youre-winner.jpg',
        sourcePath: 'projects/lalees-minigame/textures',
      }),
      {
        flags: ArxPolygonFlags.NoShadow,
      },
    ),
  }

  let monitorGeometry = new BoxGeometry(70, 70, 70, 1, 1, 1)
  monitorGeometry = toArxCoordinateSystem(monitorGeometry)

  monitorGeometry.translate(position.x, position.y, position.z)

  const monitorMesh = new Mesh(monitorGeometry, new MeshBasicMaterial({ map: computerTextures.monitorScreen }))

  return {
    meshes: [monitorMesh],
  }
}
