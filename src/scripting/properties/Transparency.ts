import { roundToNDecimals } from '@src/helpers.js'
import { ScriptProperty } from '@scripting/ScriptProperty.js'

/**
 * A ScriptProperty for setting transparency to an Entity.
 * Value can be between 0 and 1 with 2 digits precision
 *
 * @extends ScriptProperty
 *
 * fully opaque = 1
 * fully transparent = 0
 *
 * default value is 1
 */
export class Transparency extends ScriptProperty<number> {
  static get default(): Transparency {
    return new Transparency(1)
  }

  toString(): string {
    return `set_transparency ${100 - roundToNDecimals(2, this.value) * 100}`
  }
}
