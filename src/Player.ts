import { Rotation } from './Rotation'

export class Player {
  rotation: Rotation

  constructor() {
    this.rotation = new Rotation(0, 0, 0)
  }
}
