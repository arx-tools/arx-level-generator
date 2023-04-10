import { ScriptProperty } from '@scripting/ScriptProperty.js'

/**
 * @see https://wiki.arx-libertatis.org/Script:collision
 */
export class Collision extends ScriptProperty<boolean> {
  toString() {
    return `collision ${this.value === true ? 'on' : 'off'}`
  }

  // ----------------

  static get on() {
    return new Collision(true)
  }

  static get off() {
    return new Collision(false)
  }
}
