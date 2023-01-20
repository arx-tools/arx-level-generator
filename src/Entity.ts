import { ArxInteractiveObject } from 'arx-convert/types'
import { Rotation } from '@src/Rotation'
import { Vector3 } from '@src/Vector3'
import { last } from '@src/faux-ramda'
import { Script } from '@src/Script'

const instanceCatalog: Record<string, Entity[]> = {}

type EntityConstructorProps = {
  id?: number
  name: string
  position?: Vector3
  orientation?: Rotation
  isRoot?: boolean
  script?: Script
}

export class Entity {
  id: number
  name: string
  position: Vector3
  orientation: Rotation
  isRoot: boolean
  script: Script

  constructor(props: EntityConstructorProps) {
    this.name = props.name
    this.position = props.position ?? new Vector3(0, 0, 0)
    this.orientation = props.orientation ?? new Rotation(0, 0, 0)
    this.isRoot = props.isRoot ?? false
    this.script =
      props.script ??
      new Script({
        filename: (last(this.name.split('/')) as string) + '.asl',
      })

    if (typeof props.id === 'undefined') {
      instanceCatalog[this.name] = instanceCatalog[this.name] ?? []
      instanceCatalog[this.name].push(this)
      this.id = instanceCatalog[this.name].length
    } else {
      this.id = props.id
    }
  }

  public clone() {
    return new Entity({
      id: this.id,
      name: this.name,
      position: this.position.clone(),
      orientation: this.orientation.clone(),
      isRoot: this.isRoot,
      script: this.script,
    })
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

  getRef() {
    const numericId = this.id.toString().padStart(4, '0')
    const name = last(this.name.split('/')) as string

    return `${name}_${numericId}`
  }

  // ----------------

  static get marker() {
    return new Entity({ name: 'system/marker' })
  }
}
