import { type Light } from '@src/Light.js'
import { type ArxLight } from 'arx-convert/types'

export class Lights extends Array<Light> {
  toArxData(): { lights: ArxLight[] } {
    const arxLights = this.map((light) => {
      return light.toArxData()
    })

    return {
      lights: arxLights,
    }
  }

  empty(): void {
    this.length = 0
  }
}
