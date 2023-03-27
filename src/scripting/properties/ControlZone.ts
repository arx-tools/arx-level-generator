import { ScriptProperty } from '@scripting/ScriptProperty.js'
import { Zone } from '@src/Zone.js'

export class ControlZone extends ScriptProperty<Zone> {
  toString() {
    return `setcontrolledzone ${this.value.name}`
  }
}
