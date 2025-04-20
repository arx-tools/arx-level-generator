import type { Simplify } from 'type-fest'
import { Audio } from '@src/Audio.js'
import { Entity, type EntityConstructorPropsWithoutSrc } from '@src/Entity.js'
import { LoadAnim } from '@scripting/commands/LoadAnim.js'
import { Interactivity } from '@scripting/properties/Interactivity.js'
import { Scale } from '@scripting/properties/Scale.js'
import { Speed } from '@scripting/properties/Speed.js'
import { Variable } from '@scripting/properties/Variable.js'

type LeverConstructorProps = Simplify<
  EntityConstructorPropsWithoutSrc & {
    isSilent?: boolean
  }
>

export class Lever extends Entity {
  private readonly propIsPulled: Variable<boolean>

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
    this.script?.properties.push(new Scale(0.7), this.propIsPulled, new Speed(3))
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
        ${Interactivity.off.toString()}
        TIMERenable -m 1 500 ${Interactivity.on.toString()}
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

  get isPulled(): boolean {
    return this.propIsPulled.value
  }

  set isPulled(value: boolean) {
    this.propIsPulled.value = value
  }
}
