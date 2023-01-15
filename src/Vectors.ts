import { Vector3 } from '@src/Vector3'
import { BufferGeometry } from 'three'
import { uniq } from '@src/faux-ramda'

export class Vectors extends Array<Vector3> {
  static fromThreejsGeometry(obj: BufferGeometry) {
    const vectors = new Vectors()

    const index = obj.getIndex()
    const coords = obj.getAttribute('position')

    if (index === null) {
      // non-indexed, all vertices are unique
      for (let idx = 0; idx < coords.count; idx++) {
        vectors.push(new Vector3(coords.getX(idx), coords.getY(idx) * -1, coords.getZ(idx)))
      }
    } else {
      // indexed, has shared vertices
      for (let i = 0; i < index.count; i++) {
        const idx = index.getX(i)
        vectors.push(new Vector3(coords.getX(idx), coords.getY(idx) * -1, coords.getZ(idx)))
      }
    }

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
