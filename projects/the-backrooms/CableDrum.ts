import { Entity, EntityConstructorPropsWithoutSrc } from '@src/Entity.js'
import { Texture } from '@src/Texture.js'
import { Label } from '@scripting/properties/Label.js'
import { TEXTURE_DIR } from './materials.js'

// import { TweakSkin } from '@scripting/commands/TweakSkin.js'

// TODO: this was originally made by copying the rope entity as cable-drum.ftl
// but in the future it should be converted from the obj file via arx-convert's ftl converter

export class CableDrum extends Entity {
  constructor(props: EntityConstructorPropsWithoutSrc = {}) {
    super({
      src: 'items/provisions/cable_drum',
      inventoryIcon: Texture.fromCustomFile({
        sourcePath: TEXTURE_DIR,
        filename: 'cable-drum.bmp',
      }),
      model: {
        sourcePath: 'models/cable-drum',
        filename: 'cable-drum.ftl',
      },
      ...props,
    })
    this.withScript()
    this.script?.properties.push(new Label('[wire]'))
    // this.script?.on('initend', new TweakSkin(Texture.itemRope, Texture.l7DwarfMetalPlate10))
    this.script?.on('custom', () => {
      return `
        if (^$param1 == "mount_onto_wall") {
          destroy self
        }
      `
    })
  }
}
