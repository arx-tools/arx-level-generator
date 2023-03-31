import { CatacombHeavyDoor, DoorConstructorPropsWithFixSrc } from '@prefabs/entity/Door.js'
import { TweakSkin } from '@scripting/commands/TweakSkin.js'
import { Texture } from '@src/Texture.js'
import { fireExitDoor } from './materials.js'

export class FireExitDoor extends CatacombHeavyDoor {
  constructor(props: DoorConstructorPropsWithFixSrc = {}) {
    super(props)
    this.script?.on('initend', new TweakSkin(Texture.fixinterHeavyCatacombDoor, fireExitDoor))
  }
}
