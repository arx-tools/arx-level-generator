import path from 'node:path'
import { ArxInteractiveObject } from 'arx-convert/types'
import { Expand, isTiled } from 'arx-convert/utils'
import { Audio } from '@src/Audio.js'
import { EntityModel } from '@src/EntityModel.js'
import { Material } from '@src/Material.js'
import { Rotation } from '@src/Rotation.js'
import { Script } from '@src/Script.js'
import { Settings } from '@src/Settings.js'
import { Texture } from '@src/Texture.js'
import { Vector3 } from '@src/Vector3.js'
import { TextureOrMaterial } from '@src/types.js'

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
  model?: EntityModel
  /**
   * stuff that I can't put elsewhere, but needs to get exported
   */
  otherDependencies?: (Audio | TextureOrMaterial)[]
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
  model?: EntityModel
  /**
   * stuff that I can't put elsewhere, but needs to get exported
   */
  otherDependencies: (Audio | TextureOrMaterial)[] = []

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

    this.model = props.model

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

  hasModel(): this is { model: EntityModel } {
    return typeof this.model !== 'undefined'
  }

  hasInventoryIcon(): this is { inventoryIcon: Texture } {
    return typeof this.inventoryIcon !== 'undefined'
  }

  needsInventoryIcon() {
    if (!this.src.startsWith('items')) {
      return false
    }

    if (this.src.startsWith('items/movable')) {
      return false
    }

    return true
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
      inventoryIcon: this.inventoryIcon?.clone(),
      // script: TODO,
      model: this.model?.clone(),
      otherDependencies: this.otherDependencies.map((dependency) => dependency.clone()),
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

    if (!this.needsInventoryIcon()) {
      return files
    }

    if (this.hasInventoryIcon() && this.inventoryIcon.isNative) {
      return files
    }

    let source: string
    let target: string

    if (!this.hasInventoryIcon()) {
      this.inventoryIcon = Texture.missingInventoryIcon
      source = (await this.inventoryIcon.exportSourceAndTarget(settings, false))[0]
    } else {
      try {
        source = (await this.inventoryIcon.exportSourceAndTarget(settings, false, true))[0]
      } catch (e: unknown) {
        console.error(
          `[error] Entity: inventory icon not found: "${this.inventoryIcon.filename}", using default fallback icon`,
        )
        this.inventoryIcon = Texture.missingInventoryIcon
        source = (await this.inventoryIcon.exportSourceAndTarget(settings, false))[0]
      }
    }

    if (this.src.endsWith('.asl')) {
      target = path.resolve(settings.outputDir, 'graph/obj3d/interactive', this.src.replace(/.asl$/, '[icon].bmp'))
    } else {
      target = path.resolve(settings.outputDir, 'graph/obj3d/interactive', this.src, this.entityName + `[icon].bmp`)
    }

    files[target] = source

    return files
  }

  async exportOtherDependencies(settings: Settings) {
    const files: Record<string, string> = {}

    for (const stuff of this.otherDependencies) {
      if (!stuff.isNative) {
        if (stuff instanceof Texture) {
          let hasTiledMaterialFlag = false
          if (stuff instanceof Material) {
            hasTiledMaterialFlag = isTiled(stuff)
          }
          const [source, target] = await stuff.exportSourceAndTarget(settings, hasTiledMaterialFlag)
          files[target] = source
        } else {
          const [source, target] = stuff.exportSourceAndTarget(settings)
          files[target] = source
        }
      }
    }

    return files
  }

  move(offset: Vector3) {
    this.position.add(offset)
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

  static get lampGoblin1() {
    return new Entity({ src: 'fix_inter/lamp_goblin1' })
  }
  static get lampGoblin2() {
    return new Entity({ src: 'fix_inter/lamp_goblin2' })
  }
  static get lampGoblin3() {
    return new Entity({ src: 'fix_inter/lamp_goblin3' })
  }
  static get lampHuman1() {
    return new Entity({ src: 'fix_inter/lamp_human1' })
  }
  static get lampHuman2() {
    return new Entity({ src: 'fix_inter/lamp_human2' })
  }
  static get lampHuman3() {
    return new Entity({ src: 'fix_inter/lamp_human3' })
  }
  static get lampHumanPalace() {
    return new Entity({ src: 'fix_inter/lamp_human_palace' })
  }
  static get lampHumanPalaceRoom() {
    return new Entity({ src: 'fix_inter/lamp_human_palace_room' })
  }
  static get lampHumanSnake1() {
    return new Entity({ src: 'fix_inter/lamp_human_snake1' })
  }
  static get lampHumanSnake2() {
    return new Entity({ src: 'fix_inter/lamp_human_snake2' })
  }
  static get lampHumanTorch1() {
    return new Entity({ src: 'fix_inter/lamp_human_torch1' })
  }
  static get lampSnake1() {
    return new Entity({ src: 'fix_inter/lamp_snake1' })
  }
  static get lampSnake2() {
    return new Entity({ src: 'fix_inter/lamp_snake2' })
  }
}
