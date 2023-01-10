import { ArxPolygonFlags } from 'arx-convert/types'
import { ArxMap } from '@src/ArxMap'
import { Color } from '@src/Color'
import { createPlaneMesh } from '@prefabs/mesh/plane'
import { carpet } from './materials'

const createFloor = async () => {
  const floorMesh = await createPlaneMesh(800, 800, Color.white.darken(50), carpet)

  const floor = ArxMap.fromThreeJsMesh(floorMesh)
  floor.polygons.forEach((polygon) => {
    polygon.flags |= ArxPolygonFlags.Tiled
  })

  return floor
}

export const createRoom = async () => {
  const room = new ArxMap()

  room.add(await createFloor(), true)

  return room
}
