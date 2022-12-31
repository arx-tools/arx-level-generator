import { ArxLight } from 'arx-convert/types'
import { Color } from './Color'
import { Vector3 } from './Vector3'

// TODO: Three JS comes with a bunch of Light classes, might worth investigating
// https://threejs.org/docs/#api/en/lights/Light

type LightConstructorProps = {
  position: Vector3
  color: Color
  lightData: Omit<ArxLight, 'pos' | 'color'>
}

export class Light {
  position: Vector3
  color: Color
  lightData: Omit<ArxLight, 'pos' | 'color'>

  constructor(props: LightConstructorProps) {
    this.position = props.position
    this.color = props.color
    this.lightData = props.lightData
  }

  static fromArxLight({ pos, color, ...lightData }: ArxLight) {
    return new Light({
      position: Vector3.fromArxVector3(pos),
      color: Color.fromArxColor(color),
      lightData,
    })
  }

  toArxLight(): ArxLight {
    return {
      ...this.lightData,
      pos: this.position.toArxVector3(),
      color: this.color.toArxColor(),
    }
  }
}
