import { Script, type ScriptHandler } from '@src/Script.js'

export class ScriptSubroutine {
  name: string
  command: ScriptHandler
  invokeType: 'goto' | 'gosub'

  constructor(name: string, command: ScriptHandler, invokeType: 'goto' | 'gosub' = 'gosub') {
    this.name = name
    this.command = command
    this.invokeType = invokeType
  }

  toString(): string {
    const renderedScript = Script.handlerToString(this.command)

    if (renderedScript.trim() === '') {
      return ''
    }

    if (this.invokeType === 'gosub') {
      return `>>${this.name} {
${renderedScript}
  return
}`
    }

    return `>>${this.name} {
${renderedScript}
  accept
}`
  }

  invoke(): string {
    if (this.invokeType === 'gosub') {
      return `gosub ${this.name}`
    }

    return `goto ${this.name}`
  }
}
