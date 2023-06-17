import { ArxPolygonFlags } from 'arx-convert/types'
import { MathUtils, Vector2 } from 'three'
import { Audio } from '@src/Audio.js'
import { Material } from '@src/Material.js'
import { Rotation } from '@src/Rotation.js'
import { Texture } from '@src/Texture.js'
import { Vector3 } from '@src/Vector3.js'
import { Lever } from '@prefabs/entity/Lever.js'
import { SoundPlayer } from '@prefabs/entity/SoundPlayer.js'
import { createBox } from '@prefabs/mesh/box.js'
import { SoundFlags } from '@scripting/classes/Sound.js'
import { Label } from '@scripting/properties/Label.js'
import { Scale } from '@scripting/properties/Scale.js'

type createRadioProps = {
  position: Vector3
  /**
   * @default 0
   */
  angleY?: number
  /**
   * @default 1
   */
  scale?: number
  music: Audio
  /**
   * @default true
   */
  isOn?: boolean
}

const radioTextures = {
  front: Material.fromTexture(
    Texture.fromCustomFile({
      filename: 'radio-front.jpg',
      sourcePath: 'projects/lalees-minigame/textures',
    }),
    { flags: ArxPolygonFlags.NoShadow },
  ),
  back: Material.fromTexture(
    Texture.fromCustomFile({
      filename: 'radio-back.jpg',
      sourcePath: 'projects/lalees-minigame/textures',
    }),
    { flags: ArxPolygonFlags.NoShadow },
  ),
  top: Material.fromTexture(
    Texture.fromCustomFile({
      filename: 'radio-top.jpg',
      sourcePath: 'projects/lalees-minigame/textures',
    }),
    { flags: ArxPolygonFlags.NoShadow },
  ),
  side: Material.fromTexture(
    Texture.fromCustomFile({
      filename: 'radio-side.jpg',
      sourcePath: 'projects/lalees-minigame/textures',
    }),
    { flags: ArxPolygonFlags.NoShadow },
  ),
  bottom: Material.fromTexture(
    Texture.fromCustomFile({
      filename: 'radio-bottom.jpg',
      sourcePath: 'projects/lalees-minigame/textures',
    }),
    { flags: ArxPolygonFlags.NoShadow },
  ),
}

export const createRadio = async ({ position, angleY = 0, scale = 1, music, isOn = true }: createRadioProps) => {
  const boxSize = new Vector3(500 * scale, 300 * scale, 100 * scale)

  const musicPlayer = new SoundPlayer({
    audio: music,
    position: position.clone(),
    flags: SoundFlags.Loop | SoundFlags.Unique,
    autoplay: isOn,
  })

  const radioOnOffLever = new Lever({
    position: position.clone().add(new Vector3(0, -boxSize.y / 5, 0)),
    orientation: new Rotation(MathUtils.degToRad(angleY), MathUtils.degToRad(90), MathUtils.degToRad(-90)),
    isSilent: true,
  })
  radioOnOffLever.isPulled = isOn
  radioOnOffLever.script?.properties.push(new Scale(scale * 3), new Label('turn on/off radio'))
  radioOnOffLever.script?.on('custom', () => {
    return `
      if (^$param1 == "on") {
        ${musicPlayer.on()}
      }
      if (^$param1 == "off") {
        ${musicPlayer.off()}
      }
    `
  })

  const radioMesh = createBox({
    position,
    origin: new Vector2(-1, 0),
    size: boxSize,
    angleY,
    materials: [
      radioTextures.side,
      radioTextures.side,
      radioTextures.bottom,
      radioTextures.top,
      radioTextures.front,
      radioTextures.back,
    ],
  })

  return {
    entities: [musicPlayer, radioOnOffLever],
    meshes: [radioMesh],
  }
}
