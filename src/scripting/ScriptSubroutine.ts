import { Script, ScriptHandler } from '@src/Script.js'

export class ScriptSubroutine {
  name: string
  command: ScriptHandler
  invokeType: 'goto' | 'gosub'

  constructor(name: string, command: ScriptHandler, invokeType: 'goto' | 'gosub' = 'gosub') {
    this.name = name
    this.command = command
    this.invokeType = invokeType
  }

  toString() {
    const renderedScript = Script.handlerToString(this.command)
    if (renderedScript.trim() === '') {
      return ''
    }

    return [`>>${this.name} {`, renderedScript, this.invokeType === 'gosub' ? '  return' : '  accept', '}'].join('\n')
  }

  invoke() {
    if (this.invokeType === 'gosub') {
      return `gosub ${this.name}`
    } else {
      return `goto ${this.name}`
    }
  }
}
