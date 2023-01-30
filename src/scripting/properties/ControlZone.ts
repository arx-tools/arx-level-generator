import { ScriptProperty } from '@scripting/ScriptProperty'
import { Zone } from '@src/Zone'

export class ControlZone extends ScriptProperty<Zone> {
  toString() {
    return `setcontrolledzone ${this.value.name}`
  }
}
