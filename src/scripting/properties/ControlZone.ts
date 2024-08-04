import { type Zone } from '@src/Zone.js'
import { ScriptProperty } from '@scripting/ScriptProperty.js'

/**
 * A ScriptProperty for linking an Entity to a Zone.
 * A linked Zone will trigger `controlledzone_enter` and `controlledzone_leave` events on the Entity.
 *
 * @extends ScriptProperty
 * @see https://wiki.arx-libertatis.org/Script:setcontrolledzone
 */
export class ControlZone extends ScriptProperty<Zone> {
  toString(): string {
    return `setcontrolledzone ${this.value.name}`
  }
}
