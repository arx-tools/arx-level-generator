import { ArxPolygonFlags } from 'arx-convert/types'
import { BoxGeometry, MathUtils, Mesh, MeshBasicMaterial } from 'three'
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
    monitorFront: Material.fromTexture(
      await Texture.fromCustomFile({
        filename: 'monitor-front.jpg',
        sourcePath: 'projects/lalees-minigame/textures',
      }),
      {
        flags: ArxPolygonFlags.NoShadow,
      },
    ),
    monitorBack: Material.fromTexture(
      await Texture.fromCustomFile({
        filename: 'monitor-back.jpg',
        sourcePath: 'projects/lalees-minigame/textures',
      }),
      {
        flags: ArxPolygonFlags.NoShadow,
      },
    ),
    monitorLeft: Material.fromTexture(
      await Texture.fromCustomFile({
        filename: 'monitor-left.jpg',
        sourcePath: 'projects/lalees-minigame/textures',
      }),
      {
        flags: ArxPolygonFlags.NoShadow,
      },
    ),
    monitorRight: Material.fromTexture(
      await Texture.fromCustomFile({
        filename: 'monitor-right.jpg',
        sourcePath: 'projects/lalees-minigame/textures',
      }),
      {
        flags: ArxPolygonFlags.NoShadow,
      },
    ),
    monitorOtherSide: Material.fromTexture(
      await Texture.fromCustomFile({
        filename: 'monitor-other-side.jpg',
        sourcePath: 'projects/lalees-minigame/textures',
      }),
      {
        flags: ArxPolygonFlags.NoShadow,
      },
    ),
  }

  const monitorSize = 60

  let monitorGeometry = new BoxGeometry(monitorSize, monitorSize, monitorSize, 1, 1, 1)
  monitorGeometry = toArxCoordinateSystem(monitorGeometry)
  monitorGeometry.rotateY(MathUtils.degToRad(-90))
  monitorGeometry.rotateZ(MathUtils.degToRad(180))
  monitorGeometry.translate(0, -monitorSize / 2, 0)
  monitorGeometry.translate(position.x, position.y, position.z)

  const monitorMesh = new Mesh(monitorGeometry, [
    new MeshBasicMaterial({ map: computerTextures.monitorLeft }),
    new MeshBasicMaterial({ map: computerTextures.monitorRight }),
    new MeshBasicMaterial({ map: computerTextures.monitorOtherSide }),
    new MeshBasicMaterial({ map: computerTextures.monitorOtherSide }),
    new MeshBasicMaterial({ map: computerTextures.monitorFront }),
    new MeshBasicMaterial({ map: computerTextures.monitorBack }),
  ])

  // monitor image size: 232x174

  return {
    meshes: [monitorMesh],
  }
}
