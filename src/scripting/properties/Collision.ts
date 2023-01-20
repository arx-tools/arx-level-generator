import { ScriptProperty } from '@src/ScriptProperty'

export class Collision extends ScriptProperty<boolean> {
  static on = Object.freeze(new Collision(true))
  static off = Object.freeze(new Collision(false))

  toString() {
    return `collision ${this.value === true ? 'on' : 'off'}`
  }
}
