import { Fog } from './Fog.js'

export class Fogs extends Array<Fog> {
  toArxData() {
    const arxFogs = this.map((fog) => {
      return fog.toArxFog()
    })

    return {
      fogs: arxFogs,
    }
  }

  empty() {
    this.length = 0
  }
}
