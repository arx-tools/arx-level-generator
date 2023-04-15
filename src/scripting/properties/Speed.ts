import { ScriptProperty } from '@scripting/ScriptProperty.js'

export class Speed extends ScriptProperty<number> {
  toString() {
    return `set_speed ${this.value}`
  }

  static get default() {
    return new Speed(1)
  }
}
