import { ArxInteractiveObject } from 'arx-convert/types'
import { Rotation } from '@src/Rotation'
import { Vector3 } from '@src/Vector3'

type EntityConstructorProps = {
  id: number
  name: string
  position: Vector3
  orientation: Rotation
}

export class Entity {
  id: number
  name: string
  position: Vector3
  orientation: Rotation

  constructor(props: EntityConstructorProps) {
    this.id = props.id
    this.name = props.name
    this.position = props.position
    this.orientation = props.orientation
  }

  static fromArxInteractiveObject(entity: ArxInteractiveObject) {
    return new Entity({
      id: entity.identifier,
      name: entity.name,
      position: Vector3.fromArxVector3(entity.pos),
      orientation: Rotation.fromArxRotation(entity.angle),
    })
  }

  toArxInteractiveObject(): ArxInteractiveObject {
    return {
      identifier: this.id,
      name: this.name,
      pos: this.position.toArxVector3(),
      angle: this.orientation.toArxRotation(),
    }
  }
}
