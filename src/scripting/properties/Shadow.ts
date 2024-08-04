import { ScriptProperty } from '@scripting/ScriptProperty.js'

/**
 * A ScriptProperty for specifying whether an entity has a shadow or not
 *
 * @extends ScriptProperty
 * @see https://wiki.arx-libertatis.org/Script:setshadow
 */
export class Shadow extends ScriptProperty<boolean> {
  static get on(): Shadow {
    return new Shadow(true)
  }

  static get off(): Shadow {
    return new Shadow(false)
  }

  toString(): string {
    if (this.value === true) {
      return `set_shadow on`
    }

    return `set_shadow off`
  }
}
