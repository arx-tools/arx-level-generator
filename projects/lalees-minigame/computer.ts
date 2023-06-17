import { ArxPolygonFlags } from 'arx-convert/types'
import { Vector2 } from 'three'
import { Material } from '@src/Material.js'
import { Texture } from '@src/Texture.js'
import { Vector3 } from '@src/Vector3.js'
import { createBox } from '@prefabs/mesh/box.js'
import { flipUVHorizontally } from '@tools/mesh/scaleUV.js'

const textures = {
  monitorFront: Texture.fromCustomFile({
    filename: 'monitor-front.bmp',
    sourcePath: 'projects/lalees-minigame/textures',
  }),
  monitorBack: Texture.fromCustomFile({
    filename: 'monitor-back.jpg',
    sourcePath: 'projects/lalees-minigame/textures',
  }),
  monitorLeft: Texture.fromCustomFile({
    filename: 'monitor-left.jpg',
    sourcePath: 'projects/lalees-minigame/textures',
  }),
  monitorRight: Texture.fromCustomFile({
    filename: 'monitor-right.jpg',
    sourcePath: 'projects/lalees-minigame/textures',
  }),
  computerPlastic: Texture.fromCustomFile({
    filename: 'computer-plastic.jpg',
    sourcePath: 'projects/lalees-minigame/textures',
  }),
  youreWinner: Texture.fromCustomFile({
    filename: 'youre-winner.jpg',
    sourcePath: 'projects/lalees-minigame/textures',
  }),
  keyboardTop: Texture.fromCustomFile({
    filename: 'keyboard-top.jpg',
    sourcePath: 'projects/lalees-minigame/textures',
  }),
  computerCaseFront: Texture.fromCustomFile({
    filename: 'computer-case-front.jpg',
    sourcePath: 'projects/lalees-minigame/textures',
  }),
}

const createMonitor = ({ position, image, angleY = 0 }: { position: Vector3; image: Texture; angleY?: number }) => {
  const monitorBody = createBox({
    position,
    origin: new Vector2(0, 1),
    size: 40,
    angleY,
    materials: [
      Material.fromTexture(textures.monitorLeft, { flags: ArxPolygonFlags.NoShadow }),
      Material.fromTexture(textures.monitorRight, { flags: ArxPolygonFlags.NoShadow }),
      Material.fromTexture(textures.computerPlastic, { flags: ArxPolygonFlags.NoShadow }),
      Material.fromTexture(textures.computerPlastic, { flags: ArxPolygonFlags.NoShadow }),
      Material.fromTexture(textures.computerPlastic, { flags: ArxPolygonFlags.NoShadow }),
      Material.fromTexture(textures.monitorBack, { flags: ArxPolygonFlags.NoShadow }),
    ],
  })

  const monitorHead = createBox({
    position,
    origin: new Vector2(0, -1),
    size: new Vector3(50, 50, 10),
    angleY,
    materials: [
      Material.fromTexture(textures.computerPlastic, { flags: ArxPolygonFlags.NoShadow }),
      Material.fromTexture(textures.computerPlastic, { flags: ArxPolygonFlags.NoShadow }),
      Material.fromTexture(textures.computerPlastic, { flags: ArxPolygonFlags.NoShadow }),
      Material.fromTexture(textures.computerPlastic, { flags: ArxPolygonFlags.NoShadow }),
      Material.fromTexture(textures.monitorFront, { flags: ArxPolygonFlags.NoShadow }),
      Material.fromTexture(textures.computerPlastic, { flags: ArxPolygonFlags.NoShadow }),
    ],
  })

  const monitorPlinth = createBox({
    position: position.clone().add(new Vector3(0, 30, 0)),
    origin: new Vector2(0, 1.5),
    size: new Vector3(30, 6, 30),
    angleY,
    materials: Material.fromTexture(textures.computerPlastic, { flags: ArxPolygonFlags.NoShadow }),
  })

  const monitorLeg = createBox({
    position: position.clone().add(new Vector3(0, 25, 0)),
    origin: new Vector2(0, 2.25),
    size: new Vector3(20, 10, 20),
    angleY,
    materials: Material.fromTexture(textures.computerPlastic, { flags: ArxPolygonFlags.NoShadow }),
  })

  const monitorFrontBevel = createBox({
    position,
    origin: new Vector2(0, 5.6),
    size: new Vector3(46, 46 * (3 / 4), 3),
    angleY: angleY + 180,
    materials: [
      Material.fromTexture(textures.computerPlastic, { flags: ArxPolygonFlags.NoShadow | ArxPolygonFlags.DoubleSided }),
      Material.fromTexture(textures.computerPlastic, { flags: ArxPolygonFlags.NoShadow | ArxPolygonFlags.DoubleSided }),
      Material.fromTexture(textures.computerPlastic, { flags: ArxPolygonFlags.NoShadow | ArxPolygonFlags.DoubleSided }),
      Material.fromTexture(textures.computerPlastic, { flags: ArxPolygonFlags.NoShadow | ArxPolygonFlags.DoubleSided }),
      Material.fromTexture(image, {
        flags: ArxPolygonFlags.NoShadow | ArxPolygonFlags.DoubleSided | ArxPolygonFlags.Glow | ArxPolygonFlags.Tiled,
      }),
      Material.fromTexture(Texture.alpha),
    ],
  })
  flipUVHorizontally(monitorFrontBevel.geometry)

  return {
    meshes: [monitorBody, monitorHead, monitorPlinth, monitorLeg, monitorFrontBevel],
  }
}

const createKeyboard = ({ position, angleY = 0 }: { position: Vector3; angleY?: number }) => {
  const keyboard = createBox({
    position,
    origin: new Vector2(0, -1),
    size: new Vector3(50, 2, 21),
    angleY,
    materials: [
      Material.fromTexture(textures.computerPlastic, { flags: ArxPolygonFlags.NoShadow }),
      Material.fromTexture(textures.computerPlastic, { flags: ArxPolygonFlags.NoShadow }),
      Material.fromTexture(textures.computerPlastic, { flags: ArxPolygonFlags.NoShadow }),
      Material.fromTexture(textures.keyboardTop, { flags: ArxPolygonFlags.NoShadow }),
      Material.fromTexture(textures.computerPlastic, { flags: ArxPolygonFlags.NoShadow }),
      Material.fromTexture(textures.computerPlastic, { flags: ArxPolygonFlags.NoShadow }),
    ],
  })

  return {
    meshes: [keyboard],
  }
}

const createComputerCase = ({ position, angleY = 0 }: { position: Vector3; angleY?: number }) => {
  const keyboard = createBox({
    position,
    origin: new Vector2(-1, 0),
    size: new Vector3(22, 50, 60),
    angleY,
    materials: [
      Material.fromTexture(textures.computerPlastic, { flags: ArxPolygonFlags.NoShadow }),
      Material.fromTexture(textures.computerPlastic, { flags: ArxPolygonFlags.NoShadow }),
      Material.fromTexture(textures.computerPlastic, { flags: ArxPolygonFlags.NoShadow }),
      Material.fromTexture(textures.computerPlastic, { flags: ArxPolygonFlags.NoShadow }),
      Material.fromTexture(textures.computerCaseFront, { flags: ArxPolygonFlags.NoShadow }),
      Material.fromTexture(textures.computerPlastic, { flags: ArxPolygonFlags.NoShadow }),
    ],
  })

  return {
    meshes: [keyboard],
  }
}

export const createComputer = ({ position, angleY = 0 }: { position: Vector3; angleY?: number }) => {
  const monitor = createMonitor({
    position: position.clone().add(new Vector3(0, -32, 20)),
    angleY: angleY - 3,
    image: textures.youreWinner,
  })
  const keyboard = createKeyboard({ position: position.clone().add(new Vector3(-5, 0, 0)), angleY })
  const computerCase = createComputerCase({ position: position.clone().add(new Vector3(70, -25, 20)), angleY })

  return {
    meshes: [...monitor.meshes, ...keyboard.meshes, ...computerCase.meshes],
  }
}
