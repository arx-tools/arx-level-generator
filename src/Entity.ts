import path from 'node:path'
import { ArxInteractiveObject } from 'arx-convert/types'
import { Rotation } from '@src/Rotation.js'
import { Vector3 } from '@src/Vector3.js'
import { last } from '@src/faux-ramda.js'
import { Script } from '@src/Script.js'
import { Expand } from 'arx-convert/utils'

const instanceCatalog: Record<string, Entity[]> = {}

export type EntityConstructorProps = {
  id?: number
  name: string
  position?: Vector3
  orientation?: Rotation
}

export type EntityConstructorPropsWithoutName = Expand<Omit<EntityConstructorProps, 'name'>>

export class Entity {
  id: number
  name: string
  position: Vector3
  orientation: Rotation
  script?: Script

  constructor(props: EntityConstructorProps) {
    this.name = props.name
    this.position = props.position ?? new Vector3(0, 0, 0)
    this.orientation = props.orientation ?? new Rotation(0, 0, 0)

    if (typeof props.id === 'undefined') {
      instanceCatalog[this.name] = instanceCatalog[this.name] ?? []
      instanceCatalog[this.name].push(this)
      this.id = instanceCatalog[this.name].length
    } else {
      this.id = props.id
    }
  }

  withScript() {
    if (typeof this.script !== 'undefined') {
      throw new Error('trying to add a script to an Entity which already has one')
    }

    this.script = new Script({
      filename: (last(this.name.split('/')) as string) + '.asl',
    })

    return this
  }

  public clone() {
    return new Entity({
      id: this.id,
      name: this.name,
      position: this.position.clone(),
      orientation: this.orientation.clone(),
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

  get ref() {
    const numericId = this.id.toString().padStart(4, '0')
    const name = last(this.name.split('/')) as string

    return `${name}_${numericId}`
  }

  exportTarget(outputDir: string) {
    if (typeof this.script === 'undefined') {
      throw new Error("trying to export an Entity which doesn't have a script")
    }

    return path.resolve(outputDir, Script.targetPath, this.name, this.ref, this.script.filename)
  }

  // ----------------

  static get marker() {
    return new Entity({ name: 'system/marker' })
  }
  static get torch() {
    return new Entity({ name: 'items/provisions/torch' })
  }
  static get fern() {
    return new Entity({ name: 'items/magic/fern' })
  }
  static get key() {
    return new Entity({ name: 'items/quest_item/key_base' })
  }
}
