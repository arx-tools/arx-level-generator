import { ScriptCommand } from '@scripting/ScriptCommand.js'

export class UseMesh extends ScriptCommand {
  filename: string

  constructor(filename: string) {
    super()
    this.filename = filename
  }

  toString(): string {
    return `usemesh "${this.filename}"`
  }
}
