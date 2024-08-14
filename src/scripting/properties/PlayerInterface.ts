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
  static get on(): PlayerInterface {
    return new PlayerInterface(true)
  }

  static get off(): PlayerInterface {
    return new PlayerInterface(false)
  }

  static get slideIn(): PlayerInterface {
    return new PlayerInterface(true, true)
  }

  static get slideOut(): PlayerInterface {
    return new PlayerInterface(false, true)
  }

  isSliding: boolean

  constructor(value: boolean, isSliding: boolean = false) {
    super(value)
    this.isSliding = isSliding
  }

  toString(): string {
    let flags = ''
    if (this.isSliding) {
      flags = '-s'
    }

    let value: string
    if (this.value) {
      value = 'show'
    } else {
      value = 'hide'
    }

    return `playerinterface ${flags} ${value}`
  }
}
