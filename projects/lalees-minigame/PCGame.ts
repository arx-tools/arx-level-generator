import { Expand } from 'arx-convert/utils'
import { Entity, EntityConstructorPropsWithoutSrc } from '@src/Entity.js'
import { Texture } from '@src/Texture.js'
import { TweakSkin } from '@scripting/commands/TweakSkin.js'
import { Label } from '@scripting/properties/Label.js'
import { Material } from '@scripting/properties/Material.js'
import { Shadow } from '@scripting/properties/Shadow.js'
import { StackSize } from '@scripting/properties/StackSize.js'
import { Variable } from '@scripting/properties/Variable.js'

const ASSETS_DIR = 'projects/lalees-minigame'

export type PCGameVariant =
  | 'blank'
  | 'mesterlovesz'
  | 'mortyr'
  | 'wolfschanze'
  | 'traktor-racer'
  | 'americas-10-most-wanted'
  | 'big-rigs'
  | 'streets-racer'
  | 'bikini-karate-babes'

const TEXTURES: Record<PCGameVariant, Texture> = {
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
    filename: 'pcgame_box_art_wolfschanze.png',
    sourcePath: ASSETS_DIR + '/textures',
  }),
  'traktor-racer': Texture.fromCustomFile({
    filename: 'pcgame_box_art_traktor_racer.png',
    sourcePath: ASSETS_DIR + '/textures',
  }),
  'americas-10-most-wanted': Texture.fromCustomFile({
    filename: 'pcgame_box_art_americas_10_most_wanted.png',
    sourcePath: ASSETS_DIR + '/textures',
  }),
  'big-rigs': Texture.fromCustomFile({
    filename: 'pcgame_box_art_big_rigs.png',
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

type PCGameConstructorProps = Expand<
  EntityConstructorPropsWithoutSrc & {
    variant: PCGameVariant
  }
>

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

    this.script?.properties.push(this.propVariant)

    this.script?.on('init', () => {
      if (!this.script?.isRoot) {
        return ''
      }

      return [Shadow.off, Material.stone, StackSize.unstackable]
    })

    this.script?.on('initend', () => {
      if (!this.script?.isRoot) {
        return ''
      }

      return [
        new Label(`[game--${variant}]`),
        `
        if (${this.propVariant.name} == "mesterlovesz") {
          ${new TweakSkin(TEXTURES['blank'], TEXTURES['mesterlovesz'])}
        }
        if (${this.propVariant.name} == "mortyr") {
          ${new TweakSkin(TEXTURES['blank'], TEXTURES['mortyr'])}
        }
        if (${this.propVariant.name} == "wolfschanze") {
          ${new TweakSkin(TEXTURES['blank'], TEXTURES['wolfschanze'])}
        }
        if (${this.propVariant.name} == "traktor-racer") {
          ${new TweakSkin(TEXTURES['blank'], TEXTURES['traktor-racer'])}
        }
        if (${this.propVariant.name} == "americas-10-most-wanted") {
          ${new TweakSkin(TEXTURES['blank'], TEXTURES['americas-10-most-wanted'])}
        }
        if (${this.propVariant.name} == "big-rigs") {
          ${new TweakSkin(TEXTURES['blank'], TEXTURES['big-rigs'])}
        }
        if (${this.propVariant.name} == "streets-racer") {
          ${new TweakSkin(TEXTURES['blank'], TEXTURES['streets-racer'])}
        }
        if (${this.propVariant.name} == "bikini-karate-babes") {
          ${new TweakSkin(TEXTURES['blank'], TEXTURES['bikini-karate-babes'])}
        }
        `,
      ]
    })
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
