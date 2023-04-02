import path from 'node:path'
import { ArxInteractiveObject } from 'arx-convert/types'
import { Rotation } from '@src/Rotation.js'
import { Vector3 } from '@src/Vector3.js'
import { Script } from '@src/Script.js'
import { Expand } from 'arx-convert/utils'

const instanceCatalog: Record<string, Entity[]> = {}

export type EntityConstructorProps = {
  id?: number
  /**
   * specify the script file for the entity with `.asl` extension
   *
   * if the ASL file for the entity has the same name as it's container folder
   * like `items/magic/fern/fern.asl` then you can shorten it to `items/magic/fern`
   */
  src: string
  position?: Vector3
  orientation?: Rotation
}

export type EntityConstructorPropsWithoutSrc = Expand<Omit<EntityConstructorProps, 'src'>>

export class Entity {
  id: number
  src: string
  position: Vector3
  orientation: Rotation
  script?: Script

  constructor(props: EntityConstructorProps) {
    this.src = props.src
    this.position = props.position ?? new Vector3(0, 0, 0)
    this.orientation = props.orientation ?? new Rotation(0, 0, 0)

    if (typeof props.id === 'undefined') {
      instanceCatalog[this.src] = instanceCatalog[this.src] ?? []
      instanceCatalog[this.src].push(this)
      this.id = instanceCatalog[this.src].length
    } else {
      this.id = props.id
    }
  }

  get entityName() {
    return path.parse(this.src).name
  }

  withScript() {
    if (typeof this.script !== 'undefined') {
      throw new Error('trying to add a script to an Entity which already has one')
    }

    this.script = new Script({
      filename: this.entityName + '.asl',
    })

    return this
  }

  public clone() {
    return new Entity({
      id: this.id,
      src: this.src,
      position: this.position.clone(),
      orientation: this.orientation.clone(),
    })
  }

  static fromArxInteractiveObject(entity: ArxInteractiveObject) {
    return new Entity({
      id: entity.identifier,
      src: entity.name,
      position: Vector3.fromArxVector3(entity.pos),
      orientation: Rotation.fromArxRotation(entity.angle),
    })
  }

  toArxInteractiveObject(): ArxInteractiveObject {
    return {
      identifier: this.id,
      name: this.src,
      pos: this.position.toArxVector3(),
      angle: this.orientation.toArxRotation(),
    }
  }

  get ref() {
    const numericId = this.id.toString().padStart(4, '0')

    return `${this.entityName}_${numericId}`
  }

  exportTarget(outputDir: string) {
    if (typeof this.script === 'undefined') {
      throw new Error("trying to export an Entity which doesn't have a script")
    }

    return path.resolve(
      outputDir,
      Script.targetPath,
      this.src.replace(this.script.filename, ''),
      this.ref,
      this.script.filename,
    )
  }

  // ----------------

  static get marker() {
    return new Entity({ src: 'system/marker' })
  }
  static get torch() {
    return new Entity({ src: 'items/provisions/torch' })
  }
  static get fern() {
    return new Entity({ src: 'items/magic/fern' })
  }
  static get mushroom() {
    return new Entity({ src: 'items/provisions/mushroom/food_mushroom.asl' })
  }
  static get key() {
    return new Entity({ src: 'items/quest_item/key_base' })
  }
  static get powerStonePlace() {
    return new Entity({ src: 'fix_inter/power_stone_place' })
  }
  static get powerStone() {
    return new Entity({ src: 'items/magic/power_stone' })
  }
  static get lock() {
    return new Entity({ src: 'fix_inter/lock' })
  }
}
