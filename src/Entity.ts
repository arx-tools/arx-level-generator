import path from 'node:path'
import { ArxInteractiveObject } from 'arx-convert/types'
import { Expand, Optional } from 'arx-convert/utils'
import { Audio } from '@src/Audio.js'
import { Rotation } from '@src/Rotation.js'
import { Script } from '@src/Script.js'
import { Settings } from '@src/Settings.js'
import { Texture } from '@src/Texture.js'
import { Vector3 } from '@src/Vector3.js'

const instanceCatalog: Record<string, Entity[]> = {}

type ModelDescriptor = {
  sourcePath: string
  filename: string
  textures: Texture[]
}

export type EntityConstructorProps = {
  id?: number
  /**
   * specify the script file for the entity with `.asl` extension
   *
   * if the ASL file for the entity has the same name as it's container folder
   * like `items/magic/fern/fern.asl` then you can shorten it to `items/magic/fern`
   */
  src: string
  /**
   * default value is Vector3(0, 0, 0)
   */
  position?: Vector3
  /**
   * default value is Rotation(0, 0, 0)
   */
  orientation?: Rotation
  /**
   * default value is undefined
   */
  inventoryIcon?: Texture
  /**
   * default value is undefined
   */
  model?: Expand<Optional<ModelDescriptor, 'textures'>>
  /**
   * stuff that I can't put elsewhere, but needs to get exported
   */
  otherDependencies?: Audio[]
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
  inventoryIcon?: Texture
  script?: Script
  model?: ModelDescriptor
  /**
   * stuff that I can't put elsewhere, but needs to get exported
   */
  otherDependencies: Audio[] = []

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

  /**
   * returns the name of the entity without any id, for example "marker"
   */
  get entityName() {
    return path.parse(this.src).name
  }

  hasScript(): this is { script: Script } {
    return typeof this.script !== 'undefined'
  }

  hasModel(): this is { model: ModelDescriptor } {
    return typeof this.model !== 'undefined'
  }

  hasInventoryIcon(): this is { inventoryIcon: Texture } {
    return typeof this.inventoryIcon !== 'undefined'
  }

  withScript() {
    if (this.hasScript()) {
      return this
    }

    this.script = new Script({
      filename: this.entityName + '.asl',
    })

    return this
  }

  at({ position, orientation }: { position?: Vector3; orientation?: Rotation }) {
    if (typeof position !== 'undefined') {
      this.position = position
    }

    if (typeof orientation !== 'undefined') {
      this.orientation = orientation
    }

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

  /**
   * returns the reference to the entity that can be used in scripts,
   * for example "marker_0001"
   */
  get ref() {
    const numericId = this.id.toString().padStart(4, '0')

    return `${this.entityName}_${numericId}`
  }

  exportScriptTarget(settings: Settings) {
    if (!this.hasScript()) {
      throw new Error("trying to export an Entity which doesn't have a script")
    }

    if (this.script.isRoot) {
      return path.resolve(
        settings.outputDir,
        Script.targetPath,
        this.src.replace(this.script.filename, ''),
        this.script.filename,
      )
    }

    return path.resolve(
      settings.outputDir,
      Script.targetPath,
      this.src.replace(this.script.filename, ''),
      this.ref,
      this.script.filename,
    )
  }

  async exportInventoryIcon(settings: Settings) {
    const files: Record<string, string> = {}

    if (!this.hasInventoryIcon() || this.inventoryIcon.isNative) {
      return files
    }

    const [source] = await this.inventoryIcon.exportSourceAndTarget(settings, false)

    let target: string
    if (this.src.endsWith('.asl')) {
      target = path.resolve(settings.outputDir, 'graph/obj3d/interactive', this.src.replace(/.asl$/, '[icon].bmp'))
    } else {
      target = path.resolve(settings.outputDir, 'graph/obj3d/interactive', this.src, this.entityName + `[icon].bmp`)
    }

    files[target] = source

    return files
  }

  async exportTextures(settings: Settings) {
    const files: Record<string, string> = {}

    if (this.hasModel()) {
      for (let texture of this.model.textures) {
        if (!texture.isNative) {
          const [source, target] = await texture.exportSourceAndTarget(settings, false)
          files[target] = source
        }
      }
    }

    return files
  }

  exportModel(settings: Settings) {
    const files: Record<string, string> = {}

    if (this.hasModel()) {
      // TODO: handle this.src containing file extension
      const source = path.resolve(settings.assetsDir, this.model.sourcePath, this.model.filename)
      const target = path.resolve(
        settings.outputDir,
        'game/graph/obj3d/interactive',
        this.src,
        this.entityName + '.ftl',
      )

      files[target] = source
    }

    return files
  }

  exportOtherDependencies(settings: Settings) {
    const files: Record<string, string> = {}

    for (let stuff of this.otherDependencies) {
      if (!stuff.isNative) {
        const [source, target] = stuff.exportSourceAndTarget(settings)
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
    return new Entity({ src: 'items/movable/akbaa_blood_chicken_head' })
  }

  static get hangedGob() {
    return new Entity({ src: 'npc/hanged_gob' })
  }
}
