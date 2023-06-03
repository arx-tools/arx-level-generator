import { ArxPolygonFlags } from 'arx-convert/types'
import { BoxGeometry, Group, MathUtils, Mesh, MeshBasicMaterial } from 'three'
import { Audio } from '@src/Audio.js'
import { Material } from '@src/Material.js'
import { Texture } from '@src/Texture.js'
import { Vector3 } from '@src/Vector3.js'
import { SoundPlayer } from '@prefabs/entity/SoundPlayer.js'
import { SoundFlags } from '@scripting/classes/Sound.js'
import { toArxCoordinateSystem } from '@tools/mesh/toArxCoordinateSystem.js'

type createRadioProps = {
  position: Vector3
}

export const createRadio = async ({ position }: createRadioProps) => {
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

  const music = await Audio.fromCustomFile({
    filename: 'lalee-theme-song.wav',
    sourcePath: 'projects/lalees-minigame/sfx',
  })

  const musicPlayer = new SoundPlayer({
    audio: music,
    position,
    flags: SoundFlags.Loop | SoundFlags.Unique,
    autoplay: true,
  })

  let boxGeometry = new BoxGeometry(100, 60, 20, 1, 1, 1)
  boxGeometry = toArxCoordinateSystem(boxGeometry)
  boxGeometry.rotateZ(MathUtils.degToRad(180))
  boxGeometry.rotateY(MathUtils.degToRad(180))
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
    entities: [musicPlayer],
    on: () => musicPlayer.on(),
    off: () => musicPlayer.off(),
    meshes: [radioMesh],
  }
}
