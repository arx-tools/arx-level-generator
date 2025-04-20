import type { ArxInteractiveObject } from 'arx-convert/types'
import type { Entity } from '@src/Entity.js'

export class Entities extends Array<Entity> {
  toArxData(): { interactiveObjects: ArxInteractiveObject[] } {
    const arxInteractiveObjects = this.map((entity) => {
      return entity.toArxInteractiveObject()
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
