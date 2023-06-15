import { ScriptCommand } from '@scripting/ScriptCommand.js'

export abstract class ScriptProperty<T> extends ScriptCommand {
  value: T

  constructor(value: T) {
    super()
    this.value = value
  }
}
