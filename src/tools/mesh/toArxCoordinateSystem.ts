import { BufferGeometry, Object3D, Vector3 } from 'three'
import { applyTransformations } from '@src/helpers.js'

export const toArxCoordinateSystem = <T extends Object3D | BufferGeometry>(threeJsObj: T) => {
  if (threeJsObj instanceof BufferGeometry) {
    threeJsObj.scale(1, -1, 1)
  } else {
    threeJsObj.scale.y *= -1
    applyTransformations(threeJsObj)
  }
  return threeJsObj
}
