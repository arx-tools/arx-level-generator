import { ScriptProperty } from '@scripting/ScriptProperty.js'

/**
 * A ScriptProperty for specifying how fast an Entity can move.
 *
 * Affects all animations, not just movement.
 *
 * @extends ScriptProperty
 *
 * default value is 1
 */
export class Speed extends ScriptProperty<number> {
  toString() {
    return `set_speed ${this.value}`
  }

  static get default() {
    return new Speed(1)
  }
}
