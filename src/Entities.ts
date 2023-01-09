import { Entity } from './Entity'
import { Vector3 } from './Vector3'

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
}
