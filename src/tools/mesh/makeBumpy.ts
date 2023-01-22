import { randomBetween } from '@src/random'
import { Mesh } from 'three'
import { getVertices } from '@tools/mesh/getVertices'

export const makeBumpy = (volume: number, percentage: number, mesh: Mesh) => {
  const vertices = getVertices(mesh.geometry)
  const coords = mesh.geometry.getAttribute('position')

  vertices.forEach((vertex) => {
    if (randomBetween(0, 100) < percentage) {
      coords.setY(vertex.idx, vertex.vector.y + randomBetween(-volume, volume))
    }
  })
}
