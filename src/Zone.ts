import { type ArxZone, ArxZoneAndPathPointType, type ArxZoneAndPathPoint } from 'arx-convert/types'
import type { BufferGeometry } from 'three'
import { Ambience } from '@src/Ambience.js'
import type { ArxComponent } from '@src/ArxComponent.js'
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
  /**
   * default value is `Number.POSITIVE_INFINITY`
   */
  height?: number
  points: ZonePoint[]
  backgroundColor?: Color
  /**
   * default value is `5600` (source ?)
   */
  drawDistance?: number
  /**
   * default value is `Ambience.none`
   */
  ambience?: Ambience
}

export class Zone implements ArxComponent {
  static fromArxZone(zone: ArxZone): Zone {
    let height: number
    if (zone.height === -1) {
      height = Number.POSITIVE_INFINITY
    } else {
      height = zone.height
    }

    let backgroundColor: Color | undefined
    if (zone.backgroundColor !== undefined) {
      backgroundColor = Color.fromArxColor(zone.backgroundColor)
    }

    let ambience: Ambience | undefined
    if (zone.ambience !== undefined && zone.ambienceMaxVolume !== undefined) {
      ambience = new Ambience({ name: zone.ambience, volume: zone.ambienceMaxVolume })
    }

    return new Zone({
      name: zone.name,
      height,
      backgroundColor,
      drawDistance: zone.drawDistance,
      ambience,
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
        .map((position) => {
          return {
            position,
            type: ArxZoneAndPathPointType.Standard,
            time: 0,
          }
        }),
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
    let height: number
    if (this.height === Number.POSITIVE_INFINITY) {
      height = -1
    } else {
      height = this.height
    }

    return {
      name: this.name,
      backgroundColor: this.backgroundColor?.toArxColor(),
      drawDistance: this.drawDistance,
      height,
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
