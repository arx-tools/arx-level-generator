import { Entity, EntityConstructorPropsWithoutSrc } from '@src/Entity.js'
import { Texture } from '@src/Texture.js'
import { Material } from '@scripting/properties/Material.js'
import { Shadow } from '@scripting/properties/Shadow.js'
import { StackSize } from '@scripting/properties/StackSize.js'

const boxArxTexture = Texture.fromCustomFile({
  filename: 'evm_box_art.png',
  sourcePath: 'projects/lalees-minigame',
})

/**
 * EVM = Ezt Vedd Meg - a hungarian pc game (re)publisher brand name
 */
export class EVMBox extends Entity {
  constructor(props: EntityConstructorPropsWithoutSrc = {}) {
    super({
      src: 'items/quest_item/evm_box',
      inventoryIcon: Texture.fromCustomFile({
        filename: 'evm_box[icon].bmp',
        sourcePath: 'projects/lalees-minigame',
      }),
      model: {
        filename: 'evm_box.ftl',
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
 - the generator is not yet loading the custom texture of an entitiy

 - convert the obj file programmatically into evm_box.ftl -> scale it 10x
 - place it into game/graph/obj3d/interactive/items/quest_item/evm_box/
 - create script: graph/obj3d/interactive/items/quest_item/evm_box/evm_box.asl
    * noshadow
    * setname <name of the pc game>
*/
