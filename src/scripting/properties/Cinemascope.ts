import { ScriptProperty } from '@scripting/ScriptProperty.js'

/**
 * A ScriptProperty for enabling or disabling cinematic borders
 *
 * @extends ScriptProperty
 * @see https://wiki.arx-libertatis.org/Script:cinemascope
 */
export class Cinemascope extends ScriptProperty<boolean> {
  isSliding: boolean

  constructor(value: boolean, isSliding: boolean = false) {
    super(value)
    this.isSliding = isSliding
  }

  toString() {
    return `cinemascope ${this.isSliding === true ? '-s' : ''} ${this.value === true ? 'on' : 'off'}`
  }

  static get on() {
    return new Cinemascope(true)
  }

  static get off() {
    return new Cinemascope(false)
  }

  static get slideIn() {
    return new Cinemascope(true, true)
  }

  static get slideOut() {
    return new Cinemascope(false, true)
  }
}
