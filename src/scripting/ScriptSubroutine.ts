import { Script, ScriptHandler } from '@src/Script.js'

export class ScriptSubroutine {
  name: string
  command: ScriptHandler

  constructor(name: string, command: ScriptHandler) {
    this.name = name
    this.command = command
  }

  async toString() {
    return [`>>${this.name} {`, await Script.handlerToString(this.command), '  return', '}'].join('\n')
  }

  invoke() {
    return `gosub ${this.name}`
  }
}
