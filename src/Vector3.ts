import { ArxVector3 } from 'arx-level-json-converter/dist/types'
import { Vector3 as ThreeJsVector3 } from 'three'

export class Vector3 extends ThreeJsVector3 {
  toArxVector3(): ArxVector3 {
    return { x: this.x, y: this.y, z: this.z }
  }
}
