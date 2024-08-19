import { type Vector3 } from '@src/Vector3.js'

export interface ArxComponent {
  move(offset: Vector3): void
  clone(): ArxComponent
}
