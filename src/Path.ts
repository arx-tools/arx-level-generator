import type { ArxPath, ArxZoneAndPathPointType, ArxZoneAndPathPoint } from 'arx-convert/types'
import type { ArxComponent } from '@src/ArxComponent.js'
import { Vector3 } from '@src/Vector3.js'

export type PathPoint = {
  position: Vector3
  type: ArxZoneAndPathPointType
  time: number
}

type PathConstructorProps = {
  name: string
  points: PathPoint[]
}

export class Path implements ArxComponent {
  static fromArxPath(path: ArxPath): Path {
    return new Path({
      name: path.name,
      points: path.points.map((point): PathPoint => {
        return {
          position: Vector3.fromArxVector3(point.pos),
          type: point.type,
          time: point.time,
        }
      }),
    })
  }

  name: string
  points: PathPoint[]

  constructor(props: PathConstructorProps) {
    this.name = props.name
    this.points = props.points
  }

  clone(): Path {
    return new Path({
      name: this.name,
      points: this.points.map((point) => {
        return {
          position: point.position.clone(),
          type: point.type,
          time: point.time,
        }
      }),
    })
  }

  toArxPath(): ArxPath {
    return {
      name: this.name,
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
