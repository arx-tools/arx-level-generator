import { Entity } from '@src/Entity.js'

export class Entities extends Array<Entity> {
  toArxData() {
    const arxInteractiveObjects = this.map((entity) => {
      return entity.toArxInteractiveObject()
    })

    return {
      interactiveObjects: arxInteractiveObjects,
    }
  }

  empty() {
    this.length = 0
  }

  findByRef(ref: string) {
    return this.find((entity) => {
      return entity.ref === ref
    })
  }
}
