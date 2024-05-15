import { Zone } from './Zone.js'

export class Zones extends Array<Zone> {
  toArxData() {
    const arxZones = this.map((zone) => {
      return zone.toArxZone()
    })

    return {
      zones: arxZones,
    }
  }

  empty() {
    this.length = 0
  }
}
