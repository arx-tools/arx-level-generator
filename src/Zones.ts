import { type Zone } from '@src/Zone.js'
import { type ArxZone } from 'arx-convert/types'

export class Zones extends Array<Zone> {
  toArxData(): { zones: ArxZone[] } {
    const arxZones = this.map((zone) => {
      return zone.toArxZone()
    })

    return {
      zones: arxZones,
    }
  }

  empty(): void {
    this.length = 0
  }
}
