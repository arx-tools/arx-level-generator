import { Entity, EntityConstructorPropsWithoutSrc } from '@src/Entity.js'
import { Texture } from '@src/Texture.js'
import { Material } from '@scripting/properties/Material.js'
import { Shadow } from '@scripting/properties/Shadow.js'
import { StackSize } from '@scripting/properties/StackSize.js'

type PCGameVariant =
  | 'mesterlovesz'
  | 'mortyr'
  | 'wolfschanze'
  | 'traktor-racer'
  | 'americas-10-most-wanted'
  | 'big-rigs'
  | 'streets-racer'
  | 'bikini-karate-babes'

const boxArxTexture = Texture.fromCustomFile({
  filename: 'pcgame_box_art.png',
  sourcePath: 'projects/lalees-minigame',
})

export class PCGame extends Entity {
  constructor(props: EntityConstructorPropsWithoutSrc = {}) {
    super({
      src: 'items/quest_item/pcgame',
      inventoryIcon: Texture.fromCustomFile({
        filename: 'pcgame[icon].bmp',
        sourcePath: 'projects/lalees-minigame',
      }),
      model: {
        filename: 'pcgame.ftl',
        sourcePath: 'projects/lalees-minigame',
        textures: [boxArxTexture],
      },
      ...props,
    })
    this.withScript()
    this.script?.properties.push(Shadow.off, Material.stone, StackSize.unstackable)
  }
}

/*
TODOs:
 - convert the obj file programmatically into pcgame.ftl -> scale it 10x
 - place it into game/graph/obj3d/interactive/items/quest_item/pcgame/
*/
