import { ArxZoneFlags, ArxZone, ArxZonePointType, ArxZonePoint } from 'arx-convert/types'
import { Ambience } from './Ambience'
import { Color } from './Color'
import { Vector3 } from './Vector3'

export type ZonePoint = {
  position: Vector3
  type: ArxZonePointType
  time: number
}

type ZoneConstructorProps = {
  name: string
  idx: number
  flags: ArxZoneFlags
  height: number
  color: Color
  farClip: number
  ambience: Ambience
  points: ZonePoint[]
}

export class Zone {
  name: string
  idx: number
  flags: ArxZoneFlags
  height: number
  color: Color
  farClip: number
  ambience: Ambience
  points: ZonePoint[]

  constructor(props: ZoneConstructorProps) {
    this.name = props.name
    this.idx = props.idx
    this.flags = props.flags
    this.height = props.height
    this.color = props.color
    this.farClip = props.farClip
    this.ambience = props.ambience
    this.points = props.points
  }

  static fromArxZone(zone: ArxZone) {
    const { ambiance, ambianceMaxVolume, reverb } = zone

    return new Zone({
      name: zone.name,
      idx: zone.idx,
      flags: zone.flags,
      height: zone.height === -1 ? Infinity : zone.height,
      color: Color.fromArxColor(zone.color),
      farClip: zone.farClip,
      ambience: new Ambience({ src: ambiance, maxVolume: ambianceMaxVolume, reverb }),
      points: zone.points.map((point): ZonePoint => {
        return {
          position: Vector3.fromArxVector3(point.pos),
          type: point.type,
          time: point.time,
        }
      }),
    })
  }

  toArxZone(): ArxZone {
    return {
      name: this.name,
      idx: this.idx,
      flags: this.flags,
      color: this.color.toArxColor(),
      farClip: this.farClip,
      reverb: this.ambience.reverb,
      ambianceMaxVolume: this.ambience.maxVolume,
      height: this.height === Infinity ? -1 : this.height,
      ambiance: this.ambience.src,
      points: this.points.map((point): ArxZonePoint => {
        return {
          pos: point.position.toArxVector3(),
          type: point.type,
          time: point.time,
        }
      }),
    }
  }
}
