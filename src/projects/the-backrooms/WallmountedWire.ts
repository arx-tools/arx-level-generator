import { TweakSkin } from '@scripting/commands/TweakSkin.js'
import { Label } from '@scripting/properties/Label.js'
import { Entity, EntityConstructorPropsWithoutSrc } from '@src/Entity.js'
import { Texture } from '@src/Texture.js'
// import { TEXTURE_DIR } from './materials.js'

export class WallmountedWire extends Entity {
  constructor(props: EntityConstructorPropsWithoutSrc = {}) {
    super({
      src: 'fix_inter/straight-wire',
      // inventoryIcon: Texture.fromCustomFile({
      //   sourcePath: TEXTURE_DIR,
      //   filename: 'cable-drum.bmp',
      // }),
      model: {
        sourcePath: 'projects/the-backrooms/models/straight-wire',
        filename: 'straight-wire.ftl',
      },
      ...props,
    })
    this.withScript()
    this.script?.properties.push(new Label('[wire]'))
    this.script?.on('initend', new TweakSkin(Texture.itemFishingPole2, Texture.l7DwarfMetalPlate10))
  }
}
