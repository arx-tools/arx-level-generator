import { Entity } from '@src/Entity.js'
import { Vector3 } from '@src/Vector3.js'

export class Entities extends Array<Entity> {
  toArxData() {
    const arxInteractiveObjects = this.map((entity) => {
      return entity.toArxInteractiveObject()
    })

    return {
      interactiveObjects: arxInteractiveObjects,
    }
  }

  move(offset: Vector3) {
    this.forEach((entity) => {
      entity.position.add(offset)
    })
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
