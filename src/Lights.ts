import type { ArxLight } from 'arx-convert/types'
import type { Light } from '@src/Light.js'

export class Lights extends Array<Light> {
  toArxData(): { lights: ArxLight[] } {
    const arxLights = this.map((light) => {
      return light.toArxLight()
    })

    return {
      lights: arxLights,
    }
  }

  empty(): void {
    this.length = 0
  }
}
