import { CatacombHeavyDoor, DoorConstructorPropsWithFixSrc } from '@prefabs/entity/Door.js'
import { Label } from '@scripting/properties/Label.js'
import { Scale } from '@scripting/properties/Scale.js'

/**
 * 180 wide / 240 high
 */
export class FireExitDoor extends CatacombHeavyDoor {
  constructor(props: DoorConstructorPropsWithFixSrc = {}) {
    super(props)
    // this.script?.on('initend', new TweakSkin(Texture.fixinterHeavyCatacombDoor, fireExitDoor))
    this.script?.properties.push(new Label('[door--fire-exit-door]'), new Scale(1.2))
  }
}
