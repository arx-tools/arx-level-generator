import path from 'node:path'
import type { ArxInteractiveObject } from 'arx-convert/types'
import { isTiled } from 'arx-convert/utils'
import type { Simplify } from 'type-fest'
import type { ArxComponent } from '@src/ArxComponent.js'
import type { Audio } from '@src/Audio.js'
import type { EntityModel } from '@src/EntityModel.js'
import { Material } from '@src/Material.js'
import { Rotation } from '@src/Rotation.js'
import { Script } from '@src/Script.js'
import { Vector3 } from '@src/Vector3.js'
import type { FileExports, TextureOrMaterial } from '@src/types.js'
import type { Settings } from '@platform/common/Settings.js'
import { Texture } from '@platform/node/Texture.js'
import type { Cube as TypeOfCube } from '@prefabs/entity/Cube.js'
import { getFilenameFromPath } from './helpers.js'

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
  tweaks?: Record<string, EntityModel>
}

export type EntityConstructorPropsWithoutSrc = Simplify<Omit<EntityConstructorProps, 'src'>>

abstract class _Entity {}

export class Entity extends _Entity implements ArxComponent {
  static fromArxInteractiveObject(entity: ArxInteractiveObject): Entity {
    return new Entity({
      id: entity.identifier,
      src: entity.name,
      position: Vector3.fromArxVector3(entity.pos),
      orientation: Rotation.fromArxRotation(entity.angle),
    })
  }

  private static readonly instanceCatalog: Record<string, _Entity[]> = {}

  // ----------------

  static get marker(): Entity {
    return new Entity({ src: 'system/marker' })
  }

  static get torch(): Entity {
    return new Entity({ src: 'items/provisions/torch' })
  }

  static get fern(): Entity {
    return new Entity({ src: 'items/magic/fern' })
  }

  static get mushroom(): Entity {
    return new Entity({ src: 'items/provisions/mushroom/food_mushroom.asl' })
  }

  static get key(): Entity {
    return new Entity({ src: 'items/quest_item/key_base' })
  }

  static get powerStonePlace(): Entity {
    return new Entity({ src: 'fix_inter/power_stone_place' })
  }

  static get powerStone(): Entity {
    return new Entity({ src: 'items/magic/power_stone' })
  }

  static get lock(): Entity {
    return new Entity({ src: 'fix_inter/lock' })
  }

  static get rope(): Entity {
    return new Entity({ src: 'items/provisions/rope' })
  }

  static get cube(): Promise<TypeOfCube> {
    // TODO: I'm not sure about this, but this is the only way to import a class
    // which extends the base Entity class
    return (async (): Promise<TypeOfCube> => {
      const { Cube } = await import('@prefabs/entity/Cube.js')
      return new Cube()
    })()
  }

  static get bone(): Entity {
    return new Entity({ src: 'items/provisions/bone' })
  }

  static get boneWeap(): Entity {
    return new Entity({ src: 'items/weapons/bone_weap' })
  }

  static get skull(): Entity {
    return new Entity({ src: 'items/movable/skull' })
  }

  static get boneBassin(): Entity {
    return new Entity({ src: 'items/movable/bones/bone_bassin.asl' })
  }

  static get barrel(): Entity {
    return new Entity({ src: 'fix_inter/barrel/barrel.asl' })
  }

  static get brokenBottle(): Entity {
    return new Entity({ src: 'items/movable/broken_bottle' })
  }

  static get brokenShield(): Entity {
    return new Entity({ src: 'items/movable/broken_shield' })
  }

  static get brokenStool(): Entity {
    return new Entity({ src: 'items/movable/broken_stool' })
  }

  static get seatStool1(): Entity {
    return new Entity({ src: 'items/movable/seat_stool1' })
  }

  static get akbaaBloodChickenHead(): Entity {
    return new Entity({ src: 'items/movable/akbaa_blood_chicken_head' })
  }

  static get hangedGob(): Entity {
    return new Entity({ src: 'npc/hanged_gob' })
  }

  static get lampGoblin1(): Entity {
    return new Entity({ src: 'fix_inter/lamp_goblin1' })
  }

  static get lampGoblin2(): Entity {
    return new Entity({ src: 'fix_inter/lamp_goblin2' })
  }

  static get lampGoblin3(): Entity {
    return new Entity({ src: 'fix_inter/lamp_goblin3' })
  }

  static get lampHuman1(): Entity {
    return new Entity({ src: 'fix_inter/lamp_human1' })
  }

  static get lampHuman2(): Entity {
    return new Entity({ src: 'fix_inter/lamp_human2' })
  }

  static get lampHuman3(): Entity {
    return new Entity({ src: 'fix_inter/lamp_human3' })
  }

  static get lampHumanPalace(): Entity {
    return new Entity({ src: 'fix_inter/lamp_human_palace' })
  }

  static get lampHumanPalaceRoom(): Entity {
    return new Entity({ src: 'fix_inter/lamp_human_palace_room' })
  }

  static get lampHumanSnake1(): Entity {
    return new Entity({ src: 'fix_inter/lamp_human_snake1' })
  }

  static get lampHumanSnake2(): Entity {
    return new Entity({ src: 'fix_inter/lamp_human_snake2' })
  }

  static get lampHumanTorch1(): Entity {
    return new Entity({ src: 'fix_inter/lamp_human_torch1' })
  }

  static get lampSnake1(): Entity {
    return new Entity({ src: 'fix_inter/lamp_snake1' })
  }

  static get lampSnake2(): Entity {
    return new Entity({ src: 'fix_inter/lamp_snake2' })
  }

  // ----------------

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
  otherDependencies: (Audio | TextureOrMaterial)[]
  tweaks: Record<string, EntityModel>

  constructor(props: EntityConstructorProps) {
    super()

    this.src = props.src
    this.position = props.position ?? new Vector3(0, 0, 0)
    this.orientation = props.orientation ?? new Rotation(0, 0, 0)

    if (props.id === undefined) {
      Entity.instanceCatalog[this.src] = Entity.instanceCatalog[this.src] ?? []
      Entity.instanceCatalog[this.src].push(this)
      this.id = Entity.instanceCatalog[this.src].length
    } else {
      this.id = props.id
    }

    this.inventoryIcon = props.inventoryIcon

    this.model = props.model

    this.otherDependencies = props.otherDependencies ?? []

    this.tweaks = props.tweaks ?? {}
  }

  /**
   * returns the name of the entity without any id, for example "marker"
   */
  get entityName(): string {
    return getFilenameFromPath(this.src)
  }

  hasScript(): this is { script: Script } {
    return this.script !== undefined
  }

  hasModel(): this is { model: EntityModel } {
    return this.model !== undefined
  }

  hasInventoryIcon(): this is { inventoryIcon: Texture } {
    return this.inventoryIcon !== undefined
  }

  needsInventoryIcon(): boolean {
    if (!this.src.startsWith('items')) {
      return false
    }

    if (this.src.startsWith('items/movable')) {
      return false
    }

    return true
  }

  withScript(): this {
    if (this.hasScript()) {
      return this
    }

    this.script = new Script({
      filename: this.entityName + '.asl',
    })

    return this
  }

  at({ position, orientation }: { position?: Vector3; orientation?: Rotation }): this {
    if (position !== undefined) {
      this.position = position
    }

    if (orientation !== undefined) {
      this.orientation = orientation
    }

    return this
  }

  clone(): Entity {
    return new Entity({
      id: this.id,
      src: this.src,
      position: this.position.clone(),
      orientation: this.orientation.clone(),
      inventoryIcon: this.inventoryIcon?.clone(),
      // script: TODO,
      model: this.model?.clone(),
      otherDependencies: this.otherDependencies.map((dependency) => {
        return dependency.clone()
      }),
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
   * for example `"marker_0001"`
   */
  get ref(): string {
    const numericId = this.id.toString().padStart(4, '0')

    return `${this.entityName}_${numericId}`
  }

  /**
   * @throws Error when the entity doesn't have a script
   */
  exportScriptTarget(settings: Settings): string {
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

  async exportInventoryIcon(settings: Settings): Promise<FileExports> {
    const files: FileExports = {}

    if (!this.needsInventoryIcon()) {
      return files
    }

    if (this.hasInventoryIcon() && this.inventoryIcon.isNative) {
      return files
    }

    let source: string
    let target: string

    if (this.hasInventoryIcon()) {
      try {
        ;[source] = await this.inventoryIcon.exportSourceAndTarget(settings, false, true)
      } catch {
        console.error(
          `[error] Entity: inventory icon not found: "${this.inventoryIcon.filename}", using default fallback icon`,
        )
        this.inventoryIcon = Texture.missingInventoryIcon
        ;[source] = await this.inventoryIcon.exportSourceAndTarget(settings, false)
      }
    } else {
      this.inventoryIcon = Texture.missingInventoryIcon
      ;[source] = await this.inventoryIcon.exportSourceAndTarget(settings, false)
    }

    if (this.src.endsWith('.asl')) {
      target = path.resolve(settings.outputDir, 'graph/obj3d/interactive', this.src.replace(/.asl$/, '[icon].bmp'))
    } else {
      target = path.resolve(settings.outputDir, 'graph/obj3d/interactive', this.src, this.entityName + `[icon].bmp`)
    }

    files[target] = source

    return files
  }

  async exportOtherDependencies(settings: Settings): Promise<FileExports> {
    const files: FileExports = {}

    for (const audioOrTexture of this.otherDependencies) {
      if (!audioOrTexture.isNative) {
        if (audioOrTexture instanceof Texture) {
          let hasTiledMaterialFlag = false
          if (audioOrTexture instanceof Material) {
            hasTiledMaterialFlag = isTiled(audioOrTexture)
          }

          const [source, target] = await audioOrTexture.exportSourceAndTarget(settings, hasTiledMaterialFlag)
          files[target] = source
        } else {
          const [source, target] = audioOrTexture.exportSourceAndTarget(settings)
          files[target] = source
        }
      }
    }

    return files
  }

  move(offset: Vector3): void {
    this.position.add(offset)
  }
}
