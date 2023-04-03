import { ScriptCommand } from '@scripting/ScriptCommand.js'
import { ScriptProperty } from '@scripting/ScriptProperty.js'
import { ScriptSubroutine } from '@scripting/ScriptSubroutine.js'
import { UsesTextures, isUsesTextures } from '@scripting/interfaces/UsesTextures.js'

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
  eventHandlers: Record<string, (ScriptCommand | (() => string))[]> = {
    init: [],
  }

  constructor(props: ScriptConstructorProps) {
    this.filename = props.filename
  }

  async toArxData() {
    const eventStrings: string[] = []

    const eventHandlerPairs = Object.entries(this.eventHandlers)
    for (let [eventName, handlers] of eventHandlerPairs) {
      let eventString = ''

      if (eventName === 'init') {
        eventString += this.properties.map((property) => '  ' + property.toString() + '\n').join('')
      }

      for (let handler of handlers) {
        eventString += '  ' + (handler instanceof ScriptCommand ? await handler.toString() : handler()) + '\n'
      }

      eventStrings.push(`on ${eventName} {\n${eventString}  accept\n}`)
    }

    const subroutines: string[] = []
    for (let subroutine of this.subroutines) {
      subroutines.push(await subroutine.toString())
    }

    return eventStrings.join('\n') + '\n\n' + subroutines.join('\n')
  }

  on(eventName: string, handler: ScriptCommand | (() => string)) {
    this.eventHandlers[eventName] = this.eventHandlers[eventName] ?? []
    this.eventHandlers[eventName].push(handler)
  }

  async exportTextures(outputDir: string) {
    let files: Record<string, string> = {}

    const handlers = Object.values(this.eventHandlers).flat(1).filter(isUsesTextures)

    for (let handler of handlers) {
      files = { ...files, ...(await handler.exportTextures(outputDir)) }
    }

    return files
  }

  makeIntoRoot() {
    this.isRoot = true
  }
}
