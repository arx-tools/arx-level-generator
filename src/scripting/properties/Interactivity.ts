import { ScriptProperty } from '@scripting/ScriptProperty.js'

/**
 * A ScriptProperty for setting whether an Entity can be interacted with or not
 *
 * @extends ScriptProperty
 * @see https://wiki.arx-libertatis.org/Script:setinteractivity
 */
export class Interactivity extends ScriptProperty<boolean> {
  toString() {
    return `set_interactivity ${this.value === true ? 'on' : 'none'}`
  }

  static get on() {
    return new Interactivity(true)
  }

  static get off() {
    return new Interactivity(false)
  }
}
