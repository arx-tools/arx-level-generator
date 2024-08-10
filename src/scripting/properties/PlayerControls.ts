import { ScriptProperty } from '@scripting/ScriptProperty.js'

/**
 * A ScriptProperty for enabling and disabling user input.
 * Disabling player controls are necessary during cutscenes.
 *
 * @extends ScriptProperty
 * @see https://wiki.arx-libertatis.org/Script:setplayercontrols
 */
export class PlayerControls extends ScriptProperty<boolean> {
  static get on(): PlayerControls {
    return new PlayerControls(true)
  }

  static get off(): PlayerControls {
    return new PlayerControls(false)
  }

  toString(): string {
    if (this.value === true) {
      return `setplayercontrols on`
    }

    return `setplayercontrols off`
  }
}
