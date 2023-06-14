import { roundToNDecimals } from '@src/helpers.js'
import { ScriptProperty } from '@scripting/ScriptProperty.js'

/**
 * A ScriptProperty for specifying the size of an Entity.
 *
 * Value precision is only 2 decimals
 *
 * @extends ScriptProperty
 *
 * default value is 1
 */
export class Scale extends ScriptProperty<number> {
  toString() {
    return `set_scale ${roundToNDecimals(2, this.value) * 100}`
  }

  static get default() {
    return new Scale(1)
  }
}
