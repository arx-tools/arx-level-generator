import { ScriptProperty } from '@scripting/ScriptProperty.js'

/**
 * A ScriptProperty for setting the name of an Entity
 *
 * @extends ScriptProperty
 * @see https://wiki.arx-libertatis.org/Script:setname
 */
export class Label extends ScriptProperty<string> {
  toString() {
    if (this.isI18nKey()) {
      return `setname ${this.value}`
    } else {
      return `setname "${this.value}"`
    }
  }

  isI18nKey() {
    return this.value.startsWith('[') && this.value.endsWith(']')
  }
}
