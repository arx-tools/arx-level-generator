import { ScriptProperty } from '@src/ScriptProperty'

export class Interactivity extends ScriptProperty<boolean> {
  toString() {
    return `set_interactivity ${this.value === true ? 'on' : 'off'}`
  }

  // ----------------

  static get on() {
    return new Interactivity(true)
  }

  static get off() {
    return new Interactivity(false)
  }
}
