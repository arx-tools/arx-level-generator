import { Rotation } from './Rotation'
import { Vector3 } from './Vector3'

export class Player {
  orientation: Rotation
  position: Vector3

  constructor() {
    this.orientation = new Rotation(0, 0, 0)
    this.position = new Vector3(0, 0, 0)
  }
}
