import { Settings } from '@src/Settings.js'
import { ScriptCommand } from '@scripting/ScriptCommand.js'
import { ScriptProperty } from '@scripting/ScriptProperty.js'
import { ScriptSubroutine } from '@scripting/ScriptSubroutine.js'
import { isUsesTextures } from '@scripting/interfaces/UsesTextures.js'

type ScriptHandlerBase = string | string[] | ScriptCommand | ScriptCommand[]

export type ScriptHandler = ScriptHandlerBase | (() => ScriptHandlerBase)

type ScriptConstructorProps = {
  filename: string
}

export class Script {
  static readonly EOL = '\r\n'

  static targetPath = 'graph/obj3d/interactive'

  isRoot = false
  filename: string
  properties: ScriptProperty<any>[] = []
  subroutines: ScriptSubroutine[] = []
  eventHandlers: Record<string, ScriptHandler[]> = {
    init: [],
  }
  rawScripts = {
    before: '',
    after: '',
  }

  constructor(props: ScriptConstructorProps) {
    this.filename = props.filename
  }

  toArxData() {
    const eventStrings: string[] = []

    const eventHandlerPairs = Object.entries(this.eventHandlers)
    for (let [eventName, handlers] of eventHandlerPairs) {
      let eventString = ''

      if (eventName === 'init') {
        eventString += this.properties.map((property) => `  ${property.toString()}\n`).join('')
      }

      for (let handler of handlers) {
        eventString += Script.handlerToString(handler)
      }

      if (eventString.trim() !== '') {
        eventStrings.push(`on ${eventName} {\n${eventString}  accept\n}`)
      }
    }

    const subroutines: string[] = []
    for (let subroutine of this.subroutines) {
      subroutines.push(subroutine.toString())
    }

    const scriptSections = [
      this.rawScripts.before,
      eventStrings.join('\n'),
      subroutines.join('\n'),
      this.rawScripts.after,
    ]

    return scriptSections.filter((section) => section !== '').join('\n\n')
  }

  on(eventName: string, handler: ScriptHandler) {
    this.eventHandlers[eventName] = this.eventHandlers[eventName] ?? []
    this.eventHandlers[eventName].push(handler)

    return this
  }

  async exportTextures(settings: Settings) {
    let files: Record<string, string> = {}

    const handlers = Object.values(this.eventHandlers).flat(1).filter(isUsesTextures)

    for (let handler of handlers) {
      files = {
        ...files,
        ...(await handler.exportTextures(settings)),
      }
    }

    return files
  }

  makeIntoRoot() {
    this.isRoot = true

    return this
  }

  appendRaw(script: string) {
    this.rawScripts.after += (this.rawScripts.after !== '' ? '\n' : '') + script
  }

  prependRaw(script: string) {
    this.rawScripts.before += (this.rawScripts.before !== '' ? '\n' : '') + script
  }

  static handlerToString(handler: ScriptHandler) {
    const isHandlerNotAFunction =
      typeof handler === 'string' || handler instanceof ScriptCommand || Array.isArray(handler)

    const tmp = isHandlerNotAFunction ? handler : handler()
    const tmp2 = (Array.isArray(tmp) ? tmp : [tmp]) as string[] | ScriptCommand[]

    let result = ''

    for (let h of tmp2) {
      const handlerResult = h instanceof ScriptCommand ? h.toString() : h
      const handlerResults = (Array.isArray(handlerResult) ? handlerResult : [handlerResult]) as string[]
      result += handlerResults.filter((r) => r.trim() !== '').join('\n') + '\n'
    }

    return result
  }
}
