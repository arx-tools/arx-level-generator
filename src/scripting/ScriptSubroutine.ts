import { Script, ScriptHandler } from '@src/Script.js'

export class ScriptSubroutine {
  name: string
  command: ScriptHandler

  constructor(name: string, command: ScriptHandler) {
    this.name = name
    this.command = command
  }

  async toString() {
    const renderedScript = await Script.handlerToString(this.command)
    if (renderedScript.trim() === '') {
      return ''
    }

    return [`>>${this.name} {`, renderedScript, '  return', '}'].join('\n')
  }

  invoke() {
    return `gosub ${this.name}`
  }
}
