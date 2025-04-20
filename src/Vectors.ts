import type { BufferGeometry } from 'three'
import { Vector3 } from '@src/Vector3.js'
import { uniq } from '@src/faux-ramda.js'
import { getNonIndexedVertices } from '@tools/mesh/getVertices.js'

export class Vectors extends Array<Vector3> {
  static fromThreejsGeometry(geometry: BufferGeometry): Vectors {
    const vectors = new Vectors()

    getNonIndexedVertices(geometry).forEach(({ vector }) => {
      vector.y = vector.y * -1
      vectors.push(vector)
    })

    return vectors
  }

  uniq(): Vectors {
    const vectors = new Vectors()

    uniq(
      this.map((vector) => {
        return vector.toString()
      }),
    ).forEach((coords) => {
      vectors.push(Vector3.fromString(coords))
    })

    return vectors
  }
}
