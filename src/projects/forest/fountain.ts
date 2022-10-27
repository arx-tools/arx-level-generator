import path from 'path'
import { loadObj } from '../../assets/models'
import { MapData } from '../../helpers'
import { RelativeCoords } from '../../types'

export const createFountain = async (pos: RelativeCoords, mapData: MapData) => {
  const obj = await loadObj(path.resolve('./assets/projects/forest/models/fountain/fountain.obj'))
  // console.log(obj)
}
