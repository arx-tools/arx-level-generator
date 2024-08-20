import { type Settings } from '@src/Settings.js'
import { ScriptCommand } from '@scripting/ScriptCommand.js'
import { type ScriptProperty } from '@scripting/ScriptProperty.js'
import { type ScriptSubroutine } from '@scripting/ScriptSubroutine.js'
import { isUsesTextures } from '@scripting/interfaces/UsesTextures.js'

type ScriptHandlerBase = string | string[] | ScriptCommand | ScriptCommand[]

export type ScriptHandler = ScriptHandlerBase | (() => ScriptHandlerBase)

type ScriptConstructorProps = {
  filename: string
}

type ReturnOfWhenRoot = {
  on: (eventName: string, handler: ScriptHandler) => ReturnOfWhenRoot
  prependRaw: (handler: ScriptHandler) => ReturnOfWhenRoot
  appendRaw: (handler: ScriptHandler) => ReturnOfWhenRoot
}

export class Script {
  static readonly EOL = '\r\n'

  static targetPath = 'graph/obj3d/interactive'

  static handlerToString(handler: ScriptHandler): string {
    const isHandlerNotAFunction =
      typeof handler === 'string' || handler instanceof ScriptCommand || Array.isArray(handler)

    let tmp: ScriptHandlerBase
    if (isHandlerNotAFunction) {
      tmp = handler
    } else {
      tmp = handler()
    }

    let tmp2: string[] | ScriptCommand[]
    if (Array.isArray(tmp)) {
      tmp2 = tmp
    } else {
      tmp2 = [tmp]
    }

    let result = ''

    for (const h of tmp2) {
      let handlerResult
      if (h instanceof ScriptCommand) {
        handlerResult = h.toString()
      } else {
        handlerResult = h
      }

      let handlerResults: string[]
      if (Array.isArray(handlerResult)) {
        handlerResults = handlerResult
      } else {
        handlerResults = [handlerResult]
      }

      result =
        result +
        handlerResults
          .filter((r) => {
            return r.trim() !== ''
          })
          .join('\n') +
        '\n'
    }

    return result
  }

  isRoot = false
  filename: string
  properties: ScriptProperty<any>[] = []
  subroutines: ScriptSubroutine[] = []
  eventHandlers: Record<string, ScriptHandler[]> = {
    '::before': [],
    '::after': [],
    init: [],
  }

  constructor(props: ScriptConstructorProps) {
    this.filename = props.filename
  }

  toArxData(): string {
    const eventStrings: string[] = []

    const eventHandlerPairs = Object.entries(this.eventHandlers)
    for (const [eventName, handlers] of eventHandlerPairs) {
      if (eventName === '::before' || eventName === '::after') {
        continue
      }

      let eventString = ''

      if (eventName === 'init') {
        eventString =
          eventString +
          this.properties
            .map((property) => {
              return `  ${property.toString()}\n`
            })
            .join('')
      }

      for (const handler of handlers) {
        eventString = eventString + Script.handlerToString(handler)
      }

      if (eventString.trim() !== '') {
        eventStrings.push(`on ${eventName} {\n${eventString}  accept\n}`)
      }
    }

    const subroutines: string[] = []
    for (const subroutine of this.subroutines) {
      subroutines.push(subroutine.toString())
    }

    const beforeScripts = this.eventHandlers['::before'].map((script) => {
      return Script.handlerToString(script)
    })
    const afterScripts = this.eventHandlers['::after'].map((script) => {
      return Script.handlerToString(script)
    })

    const scriptSections = [
      beforeScripts.join('\n'),
      eventStrings.join('\n'),
      subroutines.join('\n'),
      afterScripts.join('\n'),
    ]

    return scriptSections
      .filter((section) => {
        return section !== ''
      })
      .join('\n\n')
  }

  on(eventName: string, handler: ScriptHandler): this {
    this.eventHandlers[eventName] = this.eventHandlers[eventName] ?? []
    this.eventHandlers[eventName].push(handler)

    return this
  }

  async exportTextures(settings: Settings): Promise<Record<string, string>> {
    let files: Record<string, string> = {}

    const handlers = Object.values(this.eventHandlers).flat(1).filter(isUsesTextures)

    for (const handler of handlers) {
      files = {
        ...files,
        ...(await handler.exportTextures(settings)),
      }
    }

    return files
  }

  makeIntoRoot(): this {
    this.isRoot = true

    return this
  }

  prependRaw(handler: ScriptHandler): this {
    this.on('::before', handler)

    return this
  }

  appendRaw(handler: ScriptHandler): this {
    this.on('::after', handler)

    return this
  }

  whenRoot(): ReturnOfWhenRoot {
    const preparedObject = {
      on: (eventName: string, handler: ScriptHandler): ReturnOfWhenRoot => {
        this.on(eventName, () => {
          if (!this.isRoot) {
            return ''
          }

          return Script.handlerToString(handler)
        })

        return preparedObject
      },
      prependRaw: (handler: ScriptHandler): ReturnOfWhenRoot => {
        this.prependRaw(() => {
          if (!this.isRoot) {
            return ''
          }

          return Script.handlerToString(handler)
        })

        return preparedObject
      },
      appendRaw: (handler: ScriptHandler): ReturnOfWhenRoot => {
        this.appendRaw(() => {
          if (!this.isRoot) {
            return ''
          }

          return Script.handlerToString(handler)
        })

        return preparedObject
      },
    }

    return preparedObject
  }
}
