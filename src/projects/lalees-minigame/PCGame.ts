import { Entity, EntityConstructorPropsWithoutSrc } from '@src/Entity.js'
import { Texture } from '@src/Texture.js'
import { TweakSkin } from '@scripting/commands/TweakSkin.js'
import { Label } from '@scripting/properties/Label.js'
import { Material } from '@scripting/properties/Material.js'
import { Shadow } from '@scripting/properties/Shadow.js'
import { StackSize } from '@scripting/properties/StackSize.js'
import { Variable } from '@scripting/properties/Variable.js'

const ASSETS_DIR = 'projects/lalees-minigame'

type PCGameVariant =
  | 'blank'
  | 'mesterlovesz'
  | 'mortyr'
  | 'wolfschanze'
  | 'traktor-racer'
  | 'americas-10-most-wanted'
  | 'big-rigs'
  | 'streets-racer'
  | 'bikini-karate-babes'

// TODO: create various box arx images
const TEXTURES: Record<PCGameVariant, Texture | Promise<Texture>> = {
  blank: Texture.fromCustomFile({
    filename: 'pcgame_box_art_blank.png',
    sourcePath: ASSETS_DIR + '/textures',
  }),
  mesterlovesz: Texture.fromCustomFile({
    filename: 'pcgame_box_art_mesterlovesz.png',
    sourcePath: ASSETS_DIR + '/textures',
  }),
  mortyr: Texture.fromCustomFile({
    filename: 'pcgame_box_art_mortyr.png',
    sourcePath: ASSETS_DIR + '/textures',
  }),
  wolfschanze: Texture.fromCustomFile({
    filename: 'pcgame_box_art_blank.png',
    sourcePath: ASSETS_DIR + '/textures',
  }),
  'traktor-racer': Texture.fromCustomFile({
    filename: 'pcgame_box_art_blank.png',
    sourcePath: ASSETS_DIR + '/textures',
  }),
  'americas-10-most-wanted': Texture.fromCustomFile({
    filename: 'pcgame_box_art_blank.png',
    sourcePath: ASSETS_DIR + '/textures',
  }),
  'big-rigs': Texture.fromCustomFile({
    filename: 'pcgame_box_art_blank.png',
    sourcePath: ASSETS_DIR + '/textures',
  }),
  'streets-racer': Texture.fromCustomFile({
    filename: 'pcgame_box_art_streets_racer.png',
    sourcePath: ASSETS_DIR + '/textures',
  }),
  'bikini-karate-babes': Texture.fromCustomFile({
    filename: 'pcgame_box_art_bikini_karate_babes.png',
    sourcePath: ASSETS_DIR + '/textures',
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

    this.propVariant = new Variable('string', 'variant', 'blank')

    this.script?.properties.push(
      Shadow.off,
      Material.stone,
      StackSize.unstackable,
      this.propVariant,
      new Label(`[game--${variant}]`),
    )

    this.script?.on('init', new TweakSkin(TEXTURES['blank'], TEXTURES[variant]))
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
