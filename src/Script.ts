import { ScriptProperty } from '@src/ScriptProperty'

type ScriptConstructorProps = {
  filename: string
}

export class Script {
  static readonly EOL = '\r\n'

  static targetPath = 'graph/obj3d/interactive'

  filename: string
  properties: ScriptProperty<any>[] = []
  eventHandlers: Record<string, (() => string)[]> = {
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
      eventString += handlers.map((handler) => '  ' + handler() + '\n').join('')
      eventStrings.push(`on ${name} {\n${eventString}  accept\n}`)
    })

    return eventStrings.join('\n')
  }

  on(eventName: string, fn: () => string) {
    this.eventHandlers[eventName] = this.eventHandlers[eventName] ?? []
    this.eventHandlers[eventName].push(fn)
  }
}
