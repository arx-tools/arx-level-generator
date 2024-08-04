import { ScriptProperty } from '@scripting/ScriptProperty.js'

/**
 * A ScriptProperty for specifying how many items of the same kind can be
 * stacked upon each other. An item can be marked unstackable by setting
 * the stack size to 1
 *
 * @extends ScriptProperty
 *
 * default value is 1
 */
export class StackSize extends ScriptProperty<number> {
  static get default(): StackSize {
    return new StackSize(10)
  }

  static get unstackable(): StackSize {
    return new StackSize(1)
  }

  toString(): string {
    return `playerstacksize ${this.value}`
  }
}
