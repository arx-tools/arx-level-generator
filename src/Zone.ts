import { ArxZone, ArxZoneAndPathPointType, ArxZoneAndPathPoint } from 'arx-convert/types'
import { Ambience } from '@src/Ambience'
import { Color } from '@src/Color'
import { Vector3 } from '@src/Vector3'
import { BufferGeometry } from 'three'
import { Vectors } from '@src/Vectors'

export type ZonePoint = {
  position: Vector3
  type: ArxZoneAndPathPointType
  time: number
}

type ZoneConstructorProps = {
  name: string
  /** default value: Infinity */
  height?: number
  points: ZonePoint[]
  backgroundColor?: Color
  drawDistance?: number
  ambience?: Ambience
}

export class Zone {
  name: string
  height: number
  points: ZonePoint[]
  backgroundColor?: Color
  drawDistance?: number
  ambience?: Ambience

  constructor(props: ZoneConstructorProps) {
    this.name = props.name
    this.height = props.height ?? Infinity
    this.backgroundColor = props.backgroundColor
    this.drawDistance = props.drawDistance
    this.ambience = props.ambience
    this.points = props.points
  }

  static fromArxZone(zone: ArxZone) {
    return new Zone({
      name: zone.name,
      height: zone.height === -1 ? Infinity : zone.height,
      backgroundColor:
        typeof zone.backgroundColor !== 'undefined' ? Color.fromArxColor(zone.backgroundColor) : undefined,
      drawDistance: zone.drawDistance,
      ambience:
        typeof zone.ambience !== 'undefined' && typeof zone.ambienceMaxVolume !== 'undefined'
          ? new Ambience({ name: zone.ambience, volume: zone.ambienceMaxVolume })
          : undefined,
      points: zone.points.map((point): ZonePoint => {
        return {
          position: Vector3.fromArxVector3(point.pos),
          type: point.type,
          time: point.time,
        }
      }),
    })
  }

  static fromThreejsGeometry(obj: BufferGeometry, props: Omit<ZoneConstructorProps, 'points'>) {
    return new Zone({
      ...props,
      points: Vectors.fromThreejsGeometry(obj)
        .uniq()
        .map((position) => ({
          position,
          type: ArxZoneAndPathPointType.Standard,
          time: 0,
        })),
    })
  }

  toArxZone(): ArxZone {
    return {
      name: this.name,
      backgroundColor: this.backgroundColor?.toArxColor(),
      drawDistance: this.drawDistance,
      height: this.height === Infinity ? -1 : this.height,
      ambience: this.ambience?.name,
      ambienceMaxVolume: this.ambience?.volume,
      points: this.points.map((point): ArxZoneAndPathPoint => {
        return {
          pos: point.position.toArxVector3(),
          type: point.type,
          time: point.time,
        }
      }),
    }
  }
}
