import { TweakSkin } from '@scripting/commands/TweakSkin.js'
import { Interactivity } from '@scripting/properties/Interactivity.js'
import { Label } from '@scripting/properties/Label.js'
import { Entity, EntityConstructorPropsWithoutSrc } from '@src/Entity.js'
import { Texture } from '@src/Texture.js'

export class Wire extends Entity {
  constructor(props: EntityConstructorPropsWithoutSrc) {
    super({
      src: 'items/provisions/pole',
      ...props,
    })
    this.withScript()
    this.script?.properties.push(new Label('[pole--wire]'))
    this.script?.on('initend', new TweakSkin(Texture.itemFishingPole2, Texture.l7DwarfMetalPlate10))
  }
}
