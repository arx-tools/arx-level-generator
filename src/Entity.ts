import path from 'node:path'
import { ArxInteractiveObject } from 'arx-convert/types'
import { Expand } from 'arx-convert/utils'
import { Rotation } from '@src/Rotation.js'
import { Script } from '@src/Script.js'
import { Texture } from '@src/Texture.js'
import { Vector3 } from '@src/Vector3.js'
import { Audio } from './Audio.js'

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
  inventoryIcon?: Texture | Promise<Texture>
  model?: {
    sourcePath: string
    filename: string
    textures?: (Texture | Promise<Texture>)[]
  }
  /**
   * stuff that I can't put elsewhere, but needs to get exported
   */
  otherDependencies?: (Audio | Promise<Audio>)[]
}

export type EntityConstructorPropsWithoutSrc = Expand<Omit<EntityConstructorProps, 'src'>>

export class Entity {
  id: number
  /**
   * specify the script file for the entity with `.asl` extension
   *
   * if the ASL file for the entity has the same name as it's container folder
   * like `items/magic/fern/fern.asl` then you can shorten it to `items/magic/fern`
   */
  src: string
  position: Vector3
  orientation: Rotation
  inventoryIcon?: Texture | Promise<Texture>
  script?: Script
  model?: {
    sourcePath: string
    filename: string
    textures: (Texture | Promise<Texture>)[]
  }
  /**
   * stuff that I can't put elsewhere, but needs to get exported
   */
  otherDependencies: (Audio | Promise<Audio>)[] = []

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

    this.inventoryIcon = props.inventoryIcon

    if (typeof props.model !== 'undefined') {
      this.model = { ...props.model, textures: props.model.textures ?? [] }
    }

    this.otherDependencies = props.otherDependencies ?? []
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
      /*
      // TODO: clone these aswell
      inventoryIcon?: Texture | Promise<Texture>
      model?: {
        sourcePath: string
        filename: string
      }
      */
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

  exportScriptTarget(outputDir: string) {
    if (typeof this.script === 'undefined') {
      throw new Error("trying to export an Entity which doesn't have a script")
    }

    if (this.script.isRoot) {
      return path.resolve(
        outputDir,
        Script.targetPath,
        this.src.replace(this.script.filename, ''),
        this.script.filename,
      )
    }

    return path.resolve(
      outputDir,
      Script.targetPath,
      this.src.replace(this.script.filename, ''),
      this.ref,
      this.script.filename,
    )
  }

  async exportInventoryIcon(outputDir: string): Promise<Record<string, string>> {
    if (this.inventoryIcon === undefined) {
      return {}
    }

    const inventoryIcon = await this.inventoryIcon
    if (inventoryIcon.isNative) {
      return {}
    }

    const [source] = await inventoryIcon.exportSourceAndTarget(outputDir, false)

    let target: string
    if (this.src.endsWith('.asl')) {
      target = path.resolve(outputDir, 'graph/obj3d/interactive', this.src.replace(/.asl$/, '[icon].bmp'))
    } else {
      target = path.resolve(outputDir, 'graph/obj3d/interactive', this.src, this.entityName + `[icon].bmp`)
    }

    return {
      [target]: source,
    }
  }

  async exportTextures(outputDir: string): Promise<Record<string, string>> {
    const files: Record<string, string> = {}

    if (typeof this.model !== 'undefined') {
      for (let texture of this.model.textures) {
        texture = await texture
        if (!texture.isNative) {
          const [source, target] = await texture.exportSourceAndTarget(outputDir, false)
          files[target] = source
        }
      }
    }

    return files
  }

  async exportModel(outputDir: string): Promise<Record<string, string>> {
    if (this.model === undefined) {
      return {}
    }

    // TODO: handle this.src containing file extension
    const source = path.resolve('assets', this.model.sourcePath, this.model.filename)
    const target = path.resolve(outputDir, 'game/graph/obj3d/interactive', this.src, this.entityName + '.ftl')

    return {
      [target]: source,
    }
  }

  async exportOtherDependencies(outputDir: string): Promise<Record<string, string>> {
    const files: Record<string, string> = {}

    for (let stuff of this.otherDependencies) {
      stuff = await stuff
      if (!stuff.isNative) {
        const [source, target] = await stuff.exportSourceAndTarget(outputDir)
        files[target] = source
      }
    }

    return files
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
  static get rope() {
    return new Entity({ src: 'items/provisions/rope' })
  }
  static get cube() {
    // TODO: I'm not sure about this, but this is the only way to import a class
    // which extends the base Entity class
    return (async () => {
      const { Cube } = await import('@prefabs/entity/Cube.js')
      return new Cube()
    })()
  }

  static get bone() {
    return new Entity({ src: 'items/provisions/bone' })
  }
  static get boneWeap() {
    return new Entity({ src: 'items/weapons/bone_weap' })
  }
  static get skull() {
    return new Entity({ src: 'items/movable/skull' })
  }
  static get boneBassin() {
    return new Entity({ src: 'items/movable/bones/bone_bassin.asl' })
  }

  static get barrel() {
    return new Entity({ src: 'fix_inter/barrel/barrel.asl' })
  }

  static get brokenBottle() {
    return new Entity({ src: 'items/movable/broken_bottle' })
  }

  static get brokenShield() {
    return new Entity({ src: 'items/movable/broken_shield' })
  }

  static get brokenStool() {
    return new Entity({ src: 'items/movable/broken_stool' })
  }
  static get seatStool1() {
    return new Entity({ src: 'items/movable/seat_stool1' })
  }

  static get akbaaBloodChickenHead() {
    return new Entity({ src: 'items/moveable/akbaa_blood_chicken_head' })
  }

  static get hangedGob() {
    return new Entity({ src: 'npc/hanged_gob' })
  }
}
