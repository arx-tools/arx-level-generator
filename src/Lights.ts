import { Light } from './Light'
import { Vector3 } from './Vector3'

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
}
