import { Cube } from '@prefabs/entity/Cube.js'
import { ScriptSubroutine } from '@scripting/ScriptSubroutine.js'
import { TweakSkin } from '@scripting/commands/TweakSkin.js'
import { Interactivity } from '@scripting/properties/Interactivity.js'
import { Scale } from '@scripting/properties/Scale.js'
import { Variable } from '@scripting/properties/Variable.js'
import { EntityConstructorPropsWithoutSrc } from '@src/Entity.js'
import { Texture } from '@src/Texture.js'

export class Button extends Cube {
  private propIsOn: Variable<boolean>
  private updateSkin: ScriptSubroutine

  constructor(props: EntityConstructorPropsWithoutSrc = {}) {
    super(props)
    this.withScript()
    this.propIsOn = new Variable('bool', 'on', false)

    const onSkin = new TweakSkin(Texture.stoneGroundCavesWet05, Texture.aliciaRoomMur02)
    const offSkin = new TweakSkin(Texture.stoneGroundCavesWet05, Texture.stoneHumanPriest4)
    this.updateSkin = new ScriptSubroutine('update_skin', async () => {
      return `
        if (${this.propIsOn.name} == 1) {
          ${await onSkin.toString()}
        } else {
          ${await offSkin.toString()}
        }
      `
    })

    this.script?.properties.push(Interactivity.on, new Scale(0.1), this.propIsOn)
    this.script?.subroutines.push(this.updateSkin)

    this.script?.on('init', () => {
      return `
        LOADANIM ACTION1 "push_button"
        GOSUB ${this.updateSkin.name}
      `
    })
    this.script?.on('action', () => {
      return `
        ${Interactivity.off}
        if (${this.propIsOn.name} == 1) {
          SET ${this.propIsOn.name} 0
        } else {
          SET ${this.propIsOn.name} 1
        }
        GOSUB ${this.updateSkin.name}
        PLAY "button_up"
        PLAYANIM -e ACTION1 ${Interactivity.on}
      `
    })
    this.script?.on('trigger', () => {
      return `
        if (^$param1 == "in") {
          if (${this.propIsOn.name} == 1) {
            sendevent trigger self "out"
          }
        }
      `
    })
  }

  get isOn() {
    return this.propIsOn.value
  }

  on() {
    this.propIsOn.value = true
  }
  off() {
    this.propIsOn.value = false
  }
}
