import { ScriptCommand } from '@scripting/ScriptCommand.js'

/**
 * @see https://wiki.arx-libertatis.org/Script:loadanim
 */
export class LoadAnim extends ScriptCommand {
  animation: string
  filename: string

  constructor(animation: string, filename: string) {
    super()
    this.animation = animation
    this.filename = filename
  }

  toString() {
    return `loadanim ${this.animation} "${this.filename}"`
  }
}
