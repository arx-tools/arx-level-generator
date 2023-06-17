import { BufferGeometry, Object3D } from 'three'
import { applyTransformations } from '@src/helpers.js'

export const toArxCoordinateSystem = (threeJsObj: Object3D | BufferGeometry) => {
  if (threeJsObj instanceof BufferGeometry) {
    threeJsObj.scale(1, -1, 1)
  } else {
    threeJsObj.scale.y *= -1
    applyTransformations(threeJsObj)
  }
  return threeJsObj
}
