import { type Entity } from '@src/Entity.js'
import { type ArxInteractiveObject } from 'arx-convert/types'

export class Entities extends Array<Entity> {
  toArxData(): { interactiveObjects: ArxInteractiveObject[] } {
    const arxInteractiveObjects = this.map((entity) => {
      return entity.toArxData()
    })

    return {
      interactiveObjects: arxInteractiveObjects,
    }
  }

  empty(): void {
    this.length = 0
  }

  findByRef(ref: string): Entity | undefined {
    return this.find((entity) => {
      return entity.ref === ref
    })
  }
}
