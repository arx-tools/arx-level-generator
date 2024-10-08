import { type BufferGeometry, Object3D } from 'three'
import { applyTransformations } from '@src/helpers.js'

// the generic syntax will make sure that if we get a Group as input, which is a descendant of Object3D
// then we'll get the same type returned. Overloads or union types will return strictly from the given types
export function toArxCoordinateSystem<T extends Object3D | BufferGeometry>(threeJsObj: T): T {
  if (threeJsObj instanceof Object3D) {
    threeJsObj.scale.y = threeJsObj.scale.y * -1
    applyTransformations(threeJsObj)
  } else {
    threeJsObj.scale(1, -1, 1)
  }

  return threeJsObj
}
