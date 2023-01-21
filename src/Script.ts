import { ScriptProperty } from '@src/ScriptProperty'

type ScriptConstructorProps = {
  filename: string
}

export class Script {
  static readonly EOL = '\r\n'

  static targetPath = 'graph/obj3d/interactive'

  filename: string
  properties: ScriptProperty<any>[] = []

  constructor(props: ScriptConstructorProps) {
    this.filename = props.filename
  }

  toArxData() {
    return `
on init {
  herosay "hello!"
  accept
}
    `
  }
}
