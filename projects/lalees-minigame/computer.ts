import { ArxPolygonFlags } from 'arx-convert/types'
import { MathUtils, Vector2 } from 'three'
import { Material } from '@src/Material.js'
import { Texture } from '@src/Texture.js'
import { Vector3 } from '@src/Vector3.js'
import { applyTransformations } from '@src/helpers.js'
import { createBox } from '@prefabs/mesh/box.js'
import { createPlaneMesh } from '@prefabs/mesh/plane.js'

const computerTextures = {
  monitorFront: Material.fromTexture(
    await Texture.fromCustomFile({
      filename: 'monitor-front.jpg',
      sourcePath: 'projects/lalees-minigame/textures',
    }),
    { flags: ArxPolygonFlags.NoShadow },
  ),
  monitorBack: Material.fromTexture(
    await Texture.fromCustomFile({
      filename: 'monitor-back.jpg',
      sourcePath: 'projects/lalees-minigame/textures',
    }),
    { flags: ArxPolygonFlags.NoShadow },
  ),
  monitorLeft: Material.fromTexture(
    await Texture.fromCustomFile({
      filename: 'monitor-left.jpg',
      sourcePath: 'projects/lalees-minigame/textures',
    }),
    { flags: ArxPolygonFlags.NoShadow },
  ),
  monitorRight: Material.fromTexture(
    await Texture.fromCustomFile({
      filename: 'monitor-right.jpg',
      sourcePath: 'projects/lalees-minigame/textures',
    }),
    { flags: ArxPolygonFlags.NoShadow },
  ),
  monitorOtherSide: Material.fromTexture(
    await Texture.fromCustomFile({
      filename: 'monitor-other-side.jpg',
      sourcePath: 'projects/lalees-minigame/textures',
    }),
    { flags: ArxPolygonFlags.NoShadow },
  ),
}

const createMonitor = async ({ position, angleY = 0 }: { position: Vector3; angleY?: number }) => {
  const monitorBody = createBox({
    position: position,
    origin: new Vector2(0, 1),
    size: 40,
    angleY,
    materials: [
      computerTextures.monitorLeft,
      computerTextures.monitorRight,
      computerTextures.monitorOtherSide,
      computerTextures.monitorOtherSide,
      computerTextures.monitorOtherSide,
      computerTextures.monitorBack,
    ],
  })

  const monitorHead = createBox({
    position: position,
    origin: new Vector2(0, -1),
    size: new Vector3(50, 50, 10),
    angleY,
    materials: [
      computerTextures.monitorOtherSide,
      computerTextures.monitorOtherSide,
      computerTextures.monitorOtherSide,
      computerTextures.monitorOtherSide,
      computerTextures.monitorFront,
      computerTextures.monitorOtherSide,
    ],
  })

  const monitorPlinth = createBox({
    position: position.clone().add(new Vector3(0, 30, 0)),
    origin: new Vector2(0, 1.5),
    size: new Vector3(30, 6, 30),
    angleY,
    materials: computerTextures.monitorOtherSide,
  })

  const monitorLeg = createBox({
    position: position.clone().add(new Vector3(0, 25, 0)),
    origin: new Vector2(0, 2.25),
    size: new Vector3(20, 10, 20),
    angleY,
    materials: computerTextures.monitorOtherSide,
  })

  const screenSize = 46
  const monitorImage = await createPlaneMesh({
    size: new Vector2(screenSize, screenSize * (3 / 4)),
    tileUV: false,
    texture: Material.fromTexture(
      await Texture.fromCustomFile({
        filename: 'youre-winner.jpg',
        sourcePath: 'projects/lalees-minigame/textures',
      }),
      {
        flags: ArxPolygonFlags.NoShadow | ArxPolygonFlags.Glow,
      },
    ),
  })
  monitorImage.rotateX(MathUtils.degToRad(90))
  applyTransformations(monitorImage)
  monitorImage.geometry.translate(0, 0, -10.25)
  monitorImage.rotateY(MathUtils.degToRad(angleY))
  applyTransformations(monitorImage)
  monitorImage.translateX(position.x)
  monitorImage.translateY(position.y)
  monitorImage.translateZ(position.z)

  return {
    entities: [],
    meshes: [monitorBody, monitorHead, monitorPlinth, monitorLeg, monitorImage],
  }
}

export const createComputer = async ({ position, angleY = 0 }: { position: Vector3; angleY?: number }) => {
  const monitor = await createMonitor({ position, angleY })

  return {
    entities: [...monitor.entities],
    meshes: [...monitor.meshes],
  }
}
