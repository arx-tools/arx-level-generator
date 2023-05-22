import { Color } from '@src/Color.js'
import { Light } from '@src/Light.js'
import { Vector3 } from '@src/Vector3.js'

export const createLight = ({
  position,
  color = Color.white,
  fallStart = 10,
  radius,
  intensity = 1,
}: {
  position: Vector3
  color?: Color
  fallStart?: number
  radius: number
  intensity?: number
}) => {
  const config = {
    color,
    position,
    fallStart,
    fallEnd: radius,
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
