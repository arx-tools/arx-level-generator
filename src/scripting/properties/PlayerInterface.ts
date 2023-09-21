import { ScriptProperty } from '@scripting/ScriptProperty.js'

/**
 * A ScriptProperty for showing and hiding a good chunk of the HUD.
 * This command does not fully hide the HUD, only some parts of it.
 * Currently the equipment indicators, inventories and minimap remain visible.
 *
 * @extends ScriptProperty
 * @see https://wiki.arx-libertatis.org/Script:playerinterface
 */
export class PlayerInterface extends ScriptProperty<boolean> {
  isSliding: boolean

  constructor(value: boolean, isSliding: boolean = false) {
    super(value)
    this.isSliding = isSliding
  }

  toString() {
    return `playerinterface ${this.isSliding === true ? '-s' : ''} ${this.value === true ? 'on' : 'off'}`
  }

  static get on() {
    return new PlayerInterface(true)
  }

  static get off() {
    return new PlayerInterface(false)
  }

  static get slideIn() {
    return new PlayerInterface(true, true)
  }

  static get slideOut() {
    return new PlayerInterface(false, true)
  }
}
