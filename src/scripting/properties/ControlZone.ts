import { ScriptProperty } from '@scripting/ScriptProperty.js'
import { Zone } from '@src/Zone.js'

/**
 * @see https://wiki.arx-libertatis.org/Script:setcontrolledzone
 */
export class ControlZone extends ScriptProperty<Zone> {
  toString() {
    return `setcontrolledzone ${this.value.name}`
  }
}
