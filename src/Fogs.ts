import { type ArxFog } from 'arx-convert/types'
import { type Fog } from '@src/Fog.js'

export class Fogs extends Array<Fog> {
  toArxData(): { fogs: ArxFog[] } {
    const arxFogs = this.map((fog) => {
      return fog.toArxFog()
    })

    return {
      fogs: arxFogs,
    }
  }

  empty(): void {
    this.length = 0
  }
}
