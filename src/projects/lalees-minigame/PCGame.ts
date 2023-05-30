import { Entity, EntityConstructorPropsWithoutSrc } from '@src/Entity.js'
import { Texture } from '@src/Texture.js'
import { Material } from '@scripting/properties/Material.js'
import { Shadow } from '@scripting/properties/Shadow.js'
import { StackSize } from '@scripting/properties/StackSize.js'
import { Variable } from '@scripting/properties/Variable.js'

const ASSETS_DIR = 'projects/lalees-minigame'

type PCGameVariant =
  | 'empty'
  | 'mesterlovesz'
  | 'mortyr'
  | 'wolfschanze'
  | 'traktor-racer'
  | 'americas-10-most-wanted'
  | 'big-rigs'
  | 'streets-racer'
  | 'bikini-karate-babes'

// TODO: create various box arx images
const TEXTURES: Record<PCGameVariant, Promise<Texture>> = {
  empty: Texture.fromCustomFile({
    filename: 'pcgame_box_art_empty.png',
    sourcePath: ASSETS_DIR + '/box-arts',
  }),
  mesterlovesz: Texture.fromCustomFile({
    filename: 'pcgame_box_art.png',
    sourcePath: ASSETS_DIR + '/box-arts',
  }),
  mortyr: Texture.fromCustomFile({
    filename: 'pcgame_box_art.png',
    sourcePath: ASSETS_DIR + '/box-arts',
  }),
  wolfschanze: Texture.fromCustomFile({
    filename: 'pcgame_box_art.png',
    sourcePath: ASSETS_DIR + '/box-arts',
  }),
  'traktor-racer': Texture.fromCustomFile({
    filename: 'pcgame_box_art.png',
    sourcePath: ASSETS_DIR + '/box-arts',
  }),
  'americas-10-most-wanted': Texture.fromCustomFile({
    filename: 'pcgame_box_art.png',
    sourcePath: ASSETS_DIR + '/box-arts',
  }),
  'big-rigs': Texture.fromCustomFile({
    filename: 'pcgame_box_art.png',
    sourcePath: ASSETS_DIR + '/box-arts',
  }),
  'streets-racer': Texture.fromCustomFile({
    filename: 'pcgame_box_art.png',
    sourcePath: ASSETS_DIR + '/box-arts',
  }),
  'bikini-karate-babes': Texture.fromCustomFile({
    filename: 'pcgame_box_art.png',
    sourcePath: ASSETS_DIR + '/box-arts',
  }),
}

type PCGameConstructorProps = EntityConstructorPropsWithoutSrc & {
  variant: PCGameVariant
}

export class PCGame extends Entity {
  private propVariant: Variable<string>

  constructor({ variant, ...props }: PCGameConstructorProps) {
    super({
      src: 'items/quest_item/pcgame',
      inventoryIcon: Texture.fromCustomFile({
        filename: 'pcgame[icon].bmp',
        sourcePath: ASSETS_DIR,
      }),
      model: {
        // TODO: convert the pcgame.obj file programmatically into pcgame.ftl
        filename: 'pcgame.ftl',
        sourcePath: ASSETS_DIR,
        textures: Object.values(TEXTURES),
        // scale: 0.1 // (after loadObj() have already scaled it up 100x)
      },
      ...props,
    })

    this.withScript()

    this.propVariant = new Variable('string', 'variant', variant)

    // default = empty -> all others = tweakskin

    this.script?.properties.push(Shadow.off, Material.stone, StackSize.unstackable, this.propVariant)
  }

  get variant() {
    return this.propVariant.value as PCGameVariant
  }

  set variant(value: PCGameVariant) {
    this.propVariant.value = value
  }

  static variantToTexture(variant: PCGameVariant) {
    return 'pcgame_box_art_streets_racer' + variant.replaceAll('-', '_')
  }
}
