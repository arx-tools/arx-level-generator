import { type Vector3 } from '@src/Vector3.js'

export interface IArxComponent {
  move(offset: Vector3): void
  clone(): IArxComponent
}
