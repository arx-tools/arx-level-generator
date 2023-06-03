import { Audio } from '@src/Audio.js'
import { Vector3 } from '@src/Vector3.js'
import { SoundPlayer } from '@projects/disco/SoundPlayer.js'
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
    flags: SoundFlags.Loop,
    autoplay: true,
  })

  return {
    entities: [musicPlayer],
  }
}
