import { Marker } from '@prefabs/entity/Marker.js'
import { ScriptSubroutine } from '@scripting/ScriptSubroutine.js'
import { Variable } from '@scripting/properties/Variable.js'
import { EntityConstructorPropsWithoutSrc } from '@src/Entity.js'

export class Timer extends Marker {
  private propStep: Variable<number>
  private propMaxSteps: Variable<number>
  private propIsOn: Variable<boolean>

  private mainLoop: ScriptSubroutine

  constructor(props: EntityConstructorPropsWithoutSrc = {}) {
    super(props)
    this.withScript()

    this.propStep = new Variable('int', 'step', 0)
    this.propMaxSteps = new Variable('int', 'max_steps', 16)
    this.propIsOn = new Variable('bool', 'on', true)

    this.mainLoop = new ScriptSubroutine('main_loop', () => {
      return `
        inc ${this.propStep.name} 1
        if (${this.propStep.name} >= ${this.propMaxSteps.name}) {
          set ${this.propStep.name} 0
        }

        sendevent tick self ~${this.propStep.name}~

        if (${this.propIsOn.name} == 0) {
          accept
        }

        sendevent trigger self ~${this.propStep.name}~
      `
    })

    this.script?.properties.push(this.propStep, this.propMaxSteps, this.propIsOn)
    this.script?.subroutines.push(this.mainLoop)

    this.script?.on('initend', () => {
      return `TIMERrun_main_loop -m 0 100 GOSUB ${this.mainLoop.name}`
    })

    this.script?.on('custom', () => {
      return `
        if (^$param1 == "on") {
          set ${this.propIsOn.name} 1
          accept
        }
        if (^$param1 == "off") {
          set ${this.propIsOn.name} 0
          accept
        }
      `
    })
  }

  get isMuted() {
    return !this.propIsOn.value
  }

  set isMuted(value: boolean) {
    this.propIsOn.value = !value
  }
}
