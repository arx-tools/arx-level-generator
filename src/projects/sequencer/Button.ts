import { Cube } from '@prefabs/entity/Cube.js'
import { ScriptSubroutine } from '@scripting/ScriptSubroutine.js'
import { LoadAnim } from '@scripting/commands/LoadAnim.js'
import { TweakSkin } from '@scripting/commands/TweakSkin.js'
import { Interactivity } from '@scripting/properties/Interactivity.js'
import { Scale } from '@scripting/properties/Scale.js'
import { Variable } from '@scripting/properties/Variable.js'
import { EntityConstructorPropsWithoutSrc } from '@src/Entity.js'
import { Texture } from '@src/Texture.js'

export class Button extends Cube {
  private propIsOn: Variable<boolean>

  constructor(props: EntityConstructorPropsWithoutSrc = {}) {
    super(props)
    this.withScript()
    this.propIsOn = new Variable('bool', 'on', false)

    const onSkin = new TweakSkin(Texture.stoneGroundCavesWet05, Texture.aliciaRoomMur02)
    const offSkin = new TweakSkin(Texture.stoneGroundCavesWet05, Texture.stoneHumanPriest4)
    const updateSkin = new ScriptSubroutine('update_skin', async () => {
      return `
        if (${this.propIsOn.name} == 1) {
          ${await onSkin.toString()}
        } else {
          ${await offSkin.toString()}
        }
      `
    })

    this.script?.properties.push(Interactivity.on, new Scale(0.1), this.propIsOn)
    this.script?.subroutines.push(updateSkin)

    this.script?.on('init', new LoadAnim('action1', 'push_button'))
    this.script?.on('init', () => updateSkin.invoke())

    this.script?.on('action', () => {
      return `
        ${Interactivity.off}
        if (${this.propIsOn.name} == 1) {
          set ${this.propIsOn.name} 0
        } else {
          set ${this.propIsOn.name} 1
        }
        ${updateSkin.invoke()}
        play "button_up"
        playanim -e action1 ${Interactivity.on}
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
