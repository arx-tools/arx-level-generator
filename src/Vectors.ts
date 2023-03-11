import { Vector3 } from '@src/Vector3'
import { BufferGeometry } from 'three'
import { uniq } from '@src/faux-ramda'
import { getNonIndexedVertices } from '@tools/mesh/getVertices'

export class Vectors extends Array<Vector3> {
  static fromThreejsGeometry(geometry: BufferGeometry) {
    const vectors = new Vectors()

    getNonIndexedVertices(geometry).forEach(({ vector }) => {
      vector.y *= -1
      vectors.push(vector)
    })

    return vectors
  }

  uniq() {
    const vectors = new Vectors()

    uniq(this.map((vector) => vector.toString())).forEach((coords) => {
      vectors.push(Vector3.fromString(coords))
    })

    return vectors
  }
}
