import { Rotation } from './Rotation'

export class Player {
  orientation: Rotation

  constructor() {
    this.orientation = new Rotation(0, 0, 0)
  }
}
