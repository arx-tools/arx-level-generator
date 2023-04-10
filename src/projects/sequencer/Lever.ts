import { LoadAnim } from '@scripting/commands/LoadAnim.js'
import { Interactivity } from '@scripting/properties/Interactivity.js'
import { Label } from '@scripting/properties/Label.js'
import { Scale } from '@scripting/properties/Scale.js'
import { Variable } from '@scripting/properties/Variable.js'
import { Entity, EntityConstructorPropsWithoutSrc } from '@src/Entity.js'

export class Lever extends Entity {
  private propIsPulled: Variable<boolean>

  constructor(props: EntityConstructorPropsWithoutSrc = {}) {
    super({
      src: 'fix_inter/lever',
      ...props,
    })
    this.withScript()

    this.propIsPulled = new Variable('bool', 'pulled', false)
    this.script?.properties.push(new Scale(0.7), new Label('sound on/off'), this.propIsPulled)
    this.script?.on('init', new LoadAnim('action1', 'lever_up'))
    this.script?.on('init', new LoadAnim('action2', 'lever_down'))
    this.script?.on('init', () => {
      return `
        if (${this.propIsPulled.name} == 1) {
          playanim action2
        }
      `
    })
    this.script?.on('action', () => {
      return `
        ${Interactivity.off}
        if (${this.propIsPulled.name} == 1) {
          set ${this.propIsPulled.name} 0
          sendevent custom self off
          playanim -e action1 ${Interactivity.on}
        } else {
          set ${this.propIsPulled.name} 1
          sendevent custom self on
          playanim -e action2 ${Interactivity.on}
        }
      `
    })
  }

  get isPulled() {
    return this.propIsPulled.value
  }

  set isPulled(value: boolean) {
    this.propIsPulled.value = value
  }
}