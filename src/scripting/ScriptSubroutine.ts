import { repeat } from '@src/faux-ramda.js'
import { ScriptCommand } from './ScriptCommand.js'

export class ScriptSubroutine {
  name: string
  command: ScriptCommand | (() => string)

  constructor(name: string, command: ScriptCommand | (() => string | Promise<string>)) {
    this.name = name
    this.command = command
  }

  async toString() {
    const indentation = repeat(' ', 2).join('')
    const commands = (this.command instanceof ScriptCommand ? await this.command.toString() : await this.command())
      .trim()
      .split('\n')
      .map((line) => indentation + line.trim())

    return [`>>${this.name} {`, ...commands, indentation + 'return', '}'].join('\n')
  }
}
