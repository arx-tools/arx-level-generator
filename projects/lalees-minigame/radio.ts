import { Audio } from '@src/Audio.js'
import { Vector3 } from '@src/Vector3.js'
import { SoundPlayer } from '@prefabs/entity/SoundPlayer.js'
import { SoundFlags } from '@scripting/classes/Sound.js'

type createRadioProps = {
  position: Vector3
}

export const createRadio = async ({ position }: createRadioProps) => {
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

  return {
    entities: [musicPlayer],
    on: () => musicPlayer.on(),
    off: () => musicPlayer.off(),
  }
}
