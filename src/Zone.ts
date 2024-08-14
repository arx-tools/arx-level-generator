import { type ArxZone, type ArxZoneAndPathPointType, type ArxZoneAndPathPoint } from 'arx-convert/types'
import { type BufferGeometry } from 'three'
import { Ambience } from '@src/Ambience.js'
import { Color } from '@src/Color.js'
import { Vector3 } from '@src/Vector3.js'
import { Vectors } from '@src/Vectors.js'

export type ZonePoint = {
  position: Vector3
  type: ArxZoneAndPathPointType
  time: number
}

export type ZoneConstructorProps = {
  name: string
  /** default value: `Number.POSITIVE_INFINITY` */
  height?: number
  points: ZonePoint[]
  backgroundColor?: Color
  /** default value: 5600 ? */
  drawDistance?: number
  /** default value: Ambience.none */
  ambience?: Ambience
}

export class Zone {
  static fromArxZone(zone: ArxZone): Zone {
    return new Zone({
      name: zone.name,
      height: zone.height === -1 ? Number.POSITIVE_INFINITY : zone.height,
      backgroundColor: zone.backgroundColor !== undefined ? Color.fromArxColor(zone.backgroundColor) : undefined,
      drawDistance: zone.drawDistance,
      ambience:
        zone.ambience !== undefined && zone.ambienceMaxVolume !== undefined
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

  static fromThreejsGeometry(obj: BufferGeometry, props: Omit<ZoneConstructorProps, 'points'>): Zone {
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

  name: string
  height: number
  points: ZonePoint[]
  backgroundColor?: Color
  drawDistance?: number
  ambience?: Ambience

  constructor(props: ZoneConstructorProps) {
    this.name = props.name
    this.height = props.height ?? Number.POSITIVE_INFINITY
    this.backgroundColor = props.backgroundColor
    this.drawDistance = props.drawDistance
    this.ambience = props.ambience
    this.points = props.points
  }

  hasBackgroundColor(): this is { backgroundColor: Color } {
    return this.backgroundColor !== undefined
  }

  hasAmbience(): this is { ambience: Ambience } {
    return this.ambience !== undefined
  }

  clone(): Zone {
    return new Zone({
      name: this.name,
      height: this.height,
      backgroundColor: this.backgroundColor?.clone(),
      drawDistance: this.drawDistance,
      ambience: this.ambience?.clone(),
      points: this.points.map((point) => {
        return {
          position: point.position.clone(),
          type: point.type,
          time: point.time,
        }
      }),
    })
  }

  toArxZone(): ArxZone {
    return {
      name: this.name,
      backgroundColor: this.backgroundColor?.toArxColor(),
      drawDistance: this.drawDistance,
      height: this.height === Number.POSITIVE_INFINITY ? -1 : this.height,
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

  move(offset: Vector3): void {
    this.points.forEach((point) => {
      point.position.add(offset)
    })
  }
}
