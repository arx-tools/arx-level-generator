import { ArxPolygonFlags } from 'arx-convert/types'
import { BoxGeometry, MathUtils, Mesh, MeshBasicMaterial } from 'three'
import { Audio } from '@src/Audio.js'
import { Material } from '@src/Material.js'
import { Rotation } from '@src/Rotation.js'
import { Texture } from '@src/Texture.js'
import { Vector3 } from '@src/Vector3.js'
import { Lever } from '@prefabs/entity/Lever.js'
import { SoundPlayer } from '@prefabs/entity/SoundPlayer.js'
import { SoundFlags } from '@scripting/classes/Sound.js'
import { Label } from '@scripting/properties/Label.js'
import { Scale } from '@scripting/properties/Scale.js'
import { toArxCoordinateSystem } from '@tools/mesh/toArxCoordinateSystem.js'

type createRadioProps = {
  position: Vector3
  angleY: number
  scale: number
}

export const createRadio = async ({ position, angleY, scale }: createRadioProps) => {
  const radioTextures = {
    front: Material.fromTexture(
      await Texture.fromCustomFile({
        filename: 'radio-front.jpg',
        sourcePath: 'projects/lalees-minigame/textures',
      }),
      {
        flags: ArxPolygonFlags.NoShadow,
      },
    ),
    back: Material.fromTexture(
      await Texture.fromCustomFile({
        filename: 'radio-back.jpg',
        sourcePath: 'projects/lalees-minigame/textures',
      }),
      {
        flags: ArxPolygonFlags.NoShadow,
      },
    ),
    top: Material.fromTexture(
      await Texture.fromCustomFile({
        filename: 'radio-top.jpg',
        sourcePath: 'projects/lalees-minigame/textures',
      }),
      {
        flags: ArxPolygonFlags.NoShadow,
      },
    ),
    side: Material.fromTexture(
      await Texture.fromCustomFile({
        filename: 'radio-side.jpg',
        sourcePath: 'projects/lalees-minigame/textures',
      }),
      {
        flags: ArxPolygonFlags.NoShadow,
      },
    ),
    bottom: Material.fromTexture(
      await Texture.fromCustomFile({
        filename: 'radio-bottom.jpg',
        sourcePath: 'projects/lalees-minigame/textures',
      }),
      {
        flags: ArxPolygonFlags.NoShadow,
      },
    ),
  }

  const boxSize = new Vector3(500 * scale, 300 * scale, 100 * scale)

  const music = await Audio.fromCustomFile({
    filename: 'lalee-theme-song.wav',
    sourcePath: 'projects/lalees-minigame/sfx',
  })

  const musicPlayer = new SoundPlayer({
    audio: music,
    position: position.clone(),
    flags: SoundFlags.Loop | SoundFlags.Unique,
    autoplay: true,
  })

  const radioOnOffLever = new Lever({
    position: position.clone().add(new Vector3(0, -boxSize.y / 5, 0)),
    orientation: new Rotation(MathUtils.degToRad(angleY), MathUtils.degToRad(90), MathUtils.degToRad(-90)),
    isSilent: true,
  })
  radioOnOffLever.isPulled = true
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

  let boxGeometry = new BoxGeometry(
    boxSize.x,
    boxSize.y,
    boxSize.z,
    Math.ceil(boxSize.x / 100),
    Math.ceil(boxSize.y / 100),
    Math.ceil(boxSize.z / 100),
  )
  boxGeometry = toArxCoordinateSystem(boxGeometry)
  boxGeometry.rotateY(MathUtils.degToRad(180))
  boxGeometry.rotateZ(MathUtils.degToRad(180))
  boxGeometry.translate(-boxSize.x / 2, 0, 0)
  boxGeometry.rotateY(MathUtils.degToRad(angleY))
  boxGeometry.translate(position.x, position.y, position.z)

  // talán azzal van gond, hogy 1 face/group több polygon-t is tartalmaz?
  const radioMesh = new Mesh(boxGeometry, [
    new MeshBasicMaterial({ map: radioTextures.side }),
    new MeshBasicMaterial({ map: radioTextures.side }),
    new MeshBasicMaterial({ map: radioTextures.bottom }),
    new MeshBasicMaterial({ map: radioTextures.top }),
    new MeshBasicMaterial({ map: radioTextures.front }),
    new MeshBasicMaterial({ map: radioTextures.back }),
  ])

  return {
    entities: [musicPlayer, radioOnOffLever],
    meshes: [radioMesh],
  }
}
