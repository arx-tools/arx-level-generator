import { ScriptProperty } from '@scripting/ScriptProperty.js'

export class StackSize extends ScriptProperty<number> {
  toString() {
    return `playerstacksize ${this.value}`
  }

  static get default() {
    return new StackSize(10)
  }

  static get unstackable() {
    return new StackSize(1)
  }
}
