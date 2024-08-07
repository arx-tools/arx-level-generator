import { ScriptProperty } from '@scripting/ScriptProperty.js'

/**
 * A ScriptProperty for enabling or disabling cinematic borders
 *
 * @extends ScriptProperty
 * @see https://wiki.arx-libertatis.org/Script:cinemascope
 */
export class Cinemascope extends ScriptProperty<boolean> {
  static get on(): Cinemascope {
    return new Cinemascope(true)
  }

  static get off(): Cinemascope {
    return new Cinemascope(false)
  }

  static get slideIn(): Cinemascope {
    return new Cinemascope(true, true)
  }

  static get slideOut(): Cinemascope {
    return new Cinemascope(false, true)
  }

  isSliding: boolean

  constructor(value: boolean, isSliding: boolean = false) {
    super(value)
    this.isSliding = isSliding
  }

  toString(): string {
    return `cinemascope ${this.isSliding === true ? '-s' : ''} ${this.value === true ? 'on' : 'off'}`
  }
}
