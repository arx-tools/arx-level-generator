import { Color } from '@src/Color.js'
import { Light } from '@src/Light.js'
import { Vector3 } from '@src/Vector3.js'

export const createLight = (position: Vector3, color: Color, type: 'main' | 'small') => {
  const config = {
    color,
    position,
    fallStart: 0,
    fallEnd: 0,
    intensity: 1,
    lightData: {
      exFlicker: Color.transparent,
      exRadius: 0,
      exFrequency: 0,
      exSize: 0,
      exSpeed: 0,
      exFlareSize: 0,
    },
  }

  if (type === 'main') {
    config.fallStart = 100
    config.fallEnd = 3500
  } else {
    config.fallStart = 10
    config.fallEnd = 500
  }

  return new Light(config)
}
