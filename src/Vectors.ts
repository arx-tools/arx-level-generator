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

    uniq(this.map(({ x, y, z }) => `${x}|${y}|${z}`)).forEach((coords) => {
      const [x, y, z] = coords.split('|')
      vectors.push(new Vector3(parseFloat(x), parseFloat(y), parseFloat(z)))
    })

    return vectors
  }
}
