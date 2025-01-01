import { type ArxPath, type ArxZoneAndPathPointType, type ArxZoneAndPathPoint } from 'arx-convert/types'
import { Vector3 } from '@src/Vector3.js'
import { type IArxComponent } from '@src/ArxComponent.js'

export type PathPoint = {
  position: Vector3
  type: ArxZoneAndPathPointType
  time: number
}

type PathConstructorProps = {
  name: string
  points: PathPoint[]
}

export class Path implements IArxComponent {
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

  toArxData(): ArxPath {
    return {
      name: this.name,
      points: this.points.map((point): ArxZoneAndPathPoint => {
        return {
          pos: point.position.toArxData(),
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
