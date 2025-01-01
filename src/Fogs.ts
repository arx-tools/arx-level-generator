import { type Fog } from '@src/Fog.js'
import { type ArxFog } from 'arx-convert/types'

export class Fogs extends Array<Fog> {
  toArxData(): { fogs: ArxFog[] } {
    const arxFogs = this.map((fog) => {
      return fog.toArxData()
    })

    return {
      fogs: arxFogs,
    }
  }

  empty(): void {
    this.length = 0
  }
}
