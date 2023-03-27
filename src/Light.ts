import { ArxLight, ArxLightFlags } from 'arx-convert/types'
import { Color } from '@src/Color.js'
import { Vector3 } from '@src/Vector3.js'

// TODO: Three JS comes with a bunch of Light classes, might worth investigating
// https://threejs.org/docs/#api/en/lights/Light

type LightConstructorProps = {
  position: Vector3
  color?: Color
  flags?: ArxLightFlags
  fallStart?: number
  fallEnd?: number
  intensity?: number
  lightData: Omit<ArxLight, 'pos' | 'color' | 'flags' | 'fallStart' | 'fallEnd' | 'intensity'>
}

export class Light {
  position: Vector3
  color: Color
  flags: ArxLightFlags
  fallStart: number
  fallEnd: number
  intensity: number
  lightData: Omit<ArxLight, 'pos' | 'color' | 'flags' | 'fallStart' | 'fallEnd' | 'intensity'>

  constructor(props: LightConstructorProps) {
    this.position = props.position
    this.color = props.color ?? Color.white
    this.flags = props.flags ?? ArxLightFlags.None
    this.fallStart = props.fallStart ?? 0
    this.fallEnd = props.fallEnd ?? 100
    this.intensity = props.intensity ?? 1
    this.lightData = props.lightData
  }

  static fromArxLight({ pos, color, flags, fallStart, fallEnd, intensity, ...lightData }: ArxLight) {
    return new Light({
      position: Vector3.fromArxVector3(pos),
      color: Color.fromArxColor(color),
      flags,
      fallStart,
      fallEnd,
      intensity,
      lightData,
    })
  }

  toArxLight(): ArxLight {
    return {
      ...this.lightData,
      pos: this.position.toArxVector3(),
      color: this.color.toArxColor(),
      flags: this.flags,
      fallStart: this.fallStart,
      fallEnd: this.fallEnd,
      intensity: this.intensity,
    }
  }
}
