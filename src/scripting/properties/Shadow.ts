import { ScriptProperty } from '@scripting/ScriptProperty.js'

/**
 * A ScriptProperty for specifying whether an entity has a shadow or not
 *
 * @extends ScriptProperty
 * @see https://wiki.arx-libertatis.org/Script:setshadow
 */
export class Shadow extends ScriptProperty<boolean> {
  toString() {
    return `set_shadow ${this.value === true ? 'on' : 'off'}`
  }

  static get on() {
    return new Shadow(true)
  }

  static get off() {
    return new Shadow(false)
  }
}
