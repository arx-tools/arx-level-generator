import { ScriptProperty } from '@src/ScriptProperty'

export class Interactivity extends ScriptProperty<boolean> {
  static on = Object.freeze(new Interactivity(true))
  static off = Object.freeze(new Interactivity(false))

  toString() {
    return `set_interactivity ${this.value === true ? 'on' : 'off'}`
  }
}
