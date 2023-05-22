import { Color } from '@src/Color.js'
import { Light } from '@src/Light.js'
import { Vector3 } from '@src/Vector3.js'

export const createLight = (position: Vector3, radius: number) => {
  return new Light({
    color: Color.white,
    position,
    fallStart: 10,
    fallEnd: radius,
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
