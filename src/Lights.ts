import { Light } from '@src/Light.js'

export class Lights extends Array<Light> {
  toArxData() {
    const arxLights = this.map((light) => {
      return light.toArxLight()
    })

    return {
      lights: arxLights,
    }
  }

  empty() {
    this.length = 0
  }
}
