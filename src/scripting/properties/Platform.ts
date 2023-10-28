import { ScriptProperty } from '@scripting/ScriptProperty.js'

/**
 * A ScriptProperty for allowing the player to jump when standing on
 * this entity. This property also enables NPCs to walk on top of
 * the entity.
 *
 * @extends ScriptProperty
 * @see https://wiki.arx-libertatis.org/Script:setplatform
 */
export class Platform extends ScriptProperty<boolean> {
  toString() {
    return `set_platform ${this.value === true ? 'on' : 'off'}`
  }

  static get on() {
    return new Platform(true)
  }

  static get off() {
    return new Platform(false)
  }
}
