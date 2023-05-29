import { roundToNDecimals } from '@src/helpers.js'
import { ScriptProperty } from '@scripting/ScriptProperty.js'

/**
 * default value for transparency is 1
 * fully opaque = 1
 * fully transparent = 0
 *
 * value precision is only 2 decimals
 */
export class Transparency extends ScriptProperty<number> {
  toString() {
    return `set_transparency ${100 - roundToNDecimals(2, this.value) * 100}`
  }

  static get default() {
    return new Transparency(1)
  }
}
