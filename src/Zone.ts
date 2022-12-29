import { ArxPath, ArxZoneFlags } from 'arx-convert/types'
import { Ambience } from './Ambience'
import { Color } from './Color'
import { Vector3 } from './Vector3'

type ZoneConstructorProps = {
  name: string
  idx: number
  flags: ArxZoneFlags
  position: Vector3
  initialPosition: Vector3
  height: number
  color: Color
  farClip: number
  ambience: Ambience
}

export class Zone {
  name: string
  idx: number
  flags: ArxZoneFlags
  position: Vector3
  initialPosition: Vector3
  height: number
  color: Color
  farClip: number
  ambience: Ambience

  constructor(props: ZoneConstructorProps) {
    this.name = props.name
    this.idx = props.idx
    this.flags = props.flags
    this.position = props.position
    this.initialPosition = props.initialPosition
    this.height = props.height
    this.color = props.color
    this.farClip = props.farClip
    this.ambience = props.ambience
  }

  static fromArxZone(zone: ArxPath) {
    const { ambiance, ambianceMaxVolume, reverb } = zone.header

    return new Zone({
      name: zone.header.name,
      idx: zone.header.idx,
      flags: zone.header.flags,
      position: Vector3.fromArxVector3(zone.header.pos),
      initialPosition: Vector3.fromArxVector3(zone.header.initPos),
      height: zone.header.height === -1 ? Infinity : zone.header.height,
      color: Color.fromArxColor(zone.header.color),
      farClip: zone.header.farClip,
      ambience: new Ambience({ src: ambiance, maxVolume: ambianceMaxVolume, reverb }),
    })
  }

  toArxZone(): ArxPath {
    return {
      header: {
        name: this.name,
        idx: this.idx,
        flags: this.flags,
        initPos: this.initialPosition.toArxVector3(),
        pos: this.position.toArxVector3(),
        color: this.color.toArxColor(),
        farClip: this.farClip,
        reverb: this.ambience.reverb,
        ambianceMaxVolume: this.ambience.maxVolume,
        height: this.height === Infinity ? -1 : this.height,
        ambiance: this.ambience.src,
      },
      pathways: [],
    }
  }
}
