import { Color } from '@src/Color.js'
import { Light } from '@src/Light.js'
import { Vector3 } from '@src/Vector3.js'

export const createLight = (
  position: Vector3,
  color: Color,
  fallStart: number,
  fallEnd: number,
  intensity: number = 1,
) => {
  const config = {
    color,
    position,
    fallStart,
    fallEnd,
    intensity,
    lightData: {
      exFlicker: Color.transparent,
      exRadius: 0,
      exFrequency: 0,
      exSize: 0,
      exSpeed: 0,
      exFlareSize: 0,
    },
  }

  return new Light(config)
}
