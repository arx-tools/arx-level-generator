import { Color } from '@src/Color'
import { Light } from '@src/Light'
import { Vector3 } from '@src/Vector3'

export const createLight = (position: Vector3, size: number) => {
  return new Light({
    color: Color.white,
    position,
    fallStart: 10,
    fallEnd: size,
    intensity: 1,
    lightData: {
      exFlicker: Color.transparent,
      exRadius: 0,
      exFrequency: 0,
      exSize: 0,
      exSpeed: 0,
      exFlareSize: 0,
    },
  })
}