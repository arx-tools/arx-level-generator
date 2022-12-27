import { ArxLight } from 'arx-convert/types'
import { Color } from './Color'
import { Vector3 } from './Vector3'

type LightConstructorProps = {
  pos: Vector3
  color: Color
  lightData: Omit<ArxLight, 'pos' | 'color'>
}

export class Light {
  pos: Vector3
  color: Color
  lightData: Omit<ArxLight, 'pos' | 'color'>

  constructor(props: LightConstructorProps) {
    this.pos = props.pos
    this.color = props.color
    this.lightData = props.lightData
  }

  static fromArxLight({ pos, color, ...lightData }: ArxLight) {
    return new Light({
      pos: Vector3.fromArxVector3(pos),
      color: Color.fromArxColor(color),
      lightData,
    })
  }

  toArxPolygon() {
    return {
      ...this.lightData,
      pos: this.pos.toArxVector3(),
    }
  }
}
