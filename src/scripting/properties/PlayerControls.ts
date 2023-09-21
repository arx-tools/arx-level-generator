import { ScriptProperty } from '@scripting/ScriptProperty.js'

/**
 * A ScriptProperty for enabling and disabling user input.
 * Disabling player controls are necessary during cutscenes.
 *
 * @extends ScriptProperty
 * @see https://wiki.arx-libertatis.org/Script:setplayercontrols
 */
export class PlayerControls extends ScriptProperty<boolean> {
  toString() {
    return `setplayercontrols ${this.value === true ? 'on' : 'off'}`
  }

  static get on() {
    return new PlayerControls(true)
  }

  static get off() {
    return new PlayerControls(false)
  }
}
