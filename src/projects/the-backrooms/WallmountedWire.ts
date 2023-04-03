import { TweakSkin } from '@scripting/commands/TweakSkin.js'
import { Interactivity } from '@scripting/properties/Interactivity.js'
import { Label } from '@scripting/properties/Label.js'
import { Transparency } from '@scripting/properties/Transparency.js'
import { Variable } from '@scripting/properties/Variable.js'
import { Entity, EntityConstructorPropsWithoutSrc } from '@src/Entity.js'
import { Texture } from '@src/Texture.js'
// import { TEXTURE_DIR } from './materials.js'

export class WallmountedWire extends Entity {
  protected propIsMounted: Variable<boolean>

  constructor(props: EntityConstructorPropsWithoutSrc = {}) {
    super({
      src: 'fix_inter/straight-wire',
      model: {
        sourcePath: 'projects/the-backrooms/models/straight-wire',
        filename: 'straight-wire.ftl',
      },
      ...props,
    })
    this.withScript()

    this.propIsMounted = new Variable('bool', 'isMounted', false)

    this.script?.on('init', () => {
      return `
        if (${this.propIsMounted.name} == 0) {
          ${new Transparency(0.85)}
        } else {
          ${Interactivity.off}
        }
      `
    })

    this.script?.on('initend', new TweakSkin(Texture.itemFishingPole2, Texture.l7DwarfMetalPlate10))

    this.script?.on('combine', () => {
      return `
        if (^$param1 isclass "cable_drum") {
          ${new Transparency(1)}
          ${Interactivity.off}
          sendevent custom ^$param1 "mount_onto_wall"
          play clip
        }
      `
    })

    this.script?.properties.push(new Label('[unmounted-wire]'), this.propIsMounted)
  }

  get isMounted() {
    return this.propIsMounted.value
  }
  set isMounted(value: boolean) {
    this.propIsMounted.value = value
  }
}
