import { Texture } from '@src/Texture.js'
import { CatacombHeavyDoor, DoorConstructorPropsWithFixSrc } from '@prefabs/entity/Door.js'
import { TweakSkin } from '@scripting/commands/TweakSkin.js'
import { Label } from '@scripting/properties/Label.js'
import { Scale } from '@scripting/properties/Scale.js'
import { fireExitDoor } from './materials.js'

/**
 * 180 wide / 240 high
 */
export class FireExitDoor extends CatacombHeavyDoor {
  constructor(props: DoorConstructorPropsWithFixSrc = {}) {
    super(props)
    this.script?.on('initend', new TweakSkin(Texture.fixinterHeavyCatacombDoor, fireExitDoor))
    this.script?.properties.push(new Label('[door--fire-exit-door]'), new Scale(1.2))
  }
}
