import { Expand } from 'arx-convert/utils'
import { Audio } from '@src/Audio.js'
import { Entity, EntityConstructorPropsWithoutSrc } from '@src/Entity.js'
import { LoadAnim } from '@scripting/commands/LoadAnim.js'
import { Interactivity } from '@scripting/properties/Interactivity.js'
import { Label } from '@scripting/properties/Label.js'
import { Scale } from '@scripting/properties/Scale.js'
import { Speed } from '@scripting/properties/Speed.js'
import { Variable } from '@scripting/properties/Variable.js'

type LeverConstructorProps = Expand<
  EntityConstructorPropsWithoutSrc & {
    isSilent?: boolean
  }
>

export class Lever extends Entity {
  private propIsPulled: Variable<boolean>

  constructor({ isSilent = false, ...props }: LeverConstructorProps = {}) {
    super({
      src: 'fix_inter/lever',
      ...props,
    })
    this.withScript()

    if (isSilent) {
      Audio.mute(Audio.lever)
    }

    this.propIsPulled = new Variable('bool', 'pulled', false)
    this.script?.properties.push(new Scale(0.7), new Label('sound on/off'), this.propIsPulled, new Speed(3))
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
        TIMERenable -m 1 500 ${Interactivity.on}
        if (${this.propIsPulled.name} == 1) {
          set ${this.propIsPulled.name} 0
          sendevent custom self off
          playanim action1
        } else {
          set ${this.propIsPulled.name} 1
          sendevent custom self on
          playanim action2
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
