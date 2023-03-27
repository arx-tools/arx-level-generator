import { Light } from '@src/Light.js'
import { Vector3 } from '@src/Vector3.js'

export class Lights extends Array<Light> {
  toArxData() {
    const arxLights = this.map((light) => {
      return light.toArxLight()
    })

    return {
      lights: arxLights,
    }
  }

  move(offset: Vector3) {
    this.forEach((light) => {
      light.position.add(offset)
    })
  }

  empty() {
    this.length = 0
  }
}
