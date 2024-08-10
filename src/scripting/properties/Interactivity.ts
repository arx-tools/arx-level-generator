import { ScriptProperty } from '@scripting/ScriptProperty.js'

/**
 * A ScriptProperty for setting whether an Entity can be interacted with or not
 *
 * @extends ScriptProperty
 * @see https://wiki.arx-libertatis.org/Script:setinteractivity
 */
export class Interactivity extends ScriptProperty<boolean> {
  static get on(): Interactivity {
    return new Interactivity(true)
  }

  static get off(): Interactivity {
    return new Interactivity(false)
  }

  toString(): string {
    if (this.value === true) {
      return `set_interactivity on`
    }

    return `set_interactivity none`
  }
}
