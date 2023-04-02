import { ScriptProperty } from '@scripting/ScriptProperty.js'
import { roundToNDecimals } from '@src/helpers.js'

/**
 * default value for scale is 1
 *
 * value precision is only 2 decimals
 */
export class Scale extends ScriptProperty<number> {
  toString() {
    return `set_scale ${roundToNDecimals(2, this.value) * 100}`
  }
}
