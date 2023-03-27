import { ScriptCommand } from '@scripting/ScriptCommand.js'
import { ScriptProperty } from '@scripting/ScriptProperty.js'
import { ScriptSubroutine } from '@scripting/ScriptSubroutine.js'

type ScriptConstructorProps = {
  filename: string
}

export class Script {
  static readonly EOL = '\r\n'

  static targetPath = 'graph/obj3d/interactive'

  filename: string
  properties: ScriptProperty<any>[] = []
  subroutines: ScriptSubroutine[] = []
  eventHandlers: Record<string, (ScriptCommand | (() => string))[]> = {
    init: [],
  }

  constructor(props: ScriptConstructorProps) {
    this.filename = props.filename
  }

  toArxData() {
    const eventStrings: string[] = []
    Object.entries(this.eventHandlers).forEach(([name, handlers]) => {
      let eventString = ''
      if (name === 'init') {
        eventString += this.properties.map((property) => '  ' + property + '\n').join('')
      }
      eventString += handlers
        .map((handler) => '  ' + (handler instanceof ScriptCommand ? handler : handler()) + '\n')
        .join('')
      eventStrings.push(`on ${name} {\n${eventString}  accept\n}`)
    })

    const subroutines: string[] = []
    this.subroutines.forEach((subroutine) => {
      subroutines.push(subroutine.toString())
    })

    return eventStrings.join('\n') + '\n\n' + subroutines.join('\n')
  }

  on(eventName: string, handler: ScriptCommand | (() => string)) {
    this.eventHandlers[eventName] = this.eventHandlers[eventName] ?? []
    this.eventHandlers[eventName].push(handler)
  }
}
