import floor from './base/floor'
import wallX from './base/wallX'
import wallZ from './base/wallZ'
import { HFLIP, TEXTURE_FULL_SCALE } from '../constants'
import { textures } from '../assets/textures'
import { setTexture, setColor, setPolygonGroup, unsetPolygonGroup, MapData } from '../helpers'
import { Vector3 } from '../types'

const skybox = ([x, y, z]: Vector3, size: number, mapData: MapData) => {
  setColor('white', mapData)

  setPolygonGroup('skybox', mapData)

  setTexture(textures.skybox.back, mapData)
  wallZ([x, y, z + size], 'back', TEXTURE_FULL_SCALE, 0, size)(mapData)

  setTexture(textures.skybox.front, mapData)
  wallZ([x, y, z], 'front', TEXTURE_FULL_SCALE, 0, size, HFLIP)(mapData)

  setTexture(textures.skybox.right, mapData)
  wallX([x, y, z], 'right', TEXTURE_FULL_SCALE, 0, size)(mapData)

  setTexture(textures.skybox.left, mapData)
  wallX([x + size, y, z], 'left', TEXTURE_FULL_SCALE, 0, size, HFLIP)(mapData)

  setTexture(textures.skybox.bottom, mapData)
  floor({ type: 'absolute', coords: [x, y + size / 2, z] }, 'floor', TEXTURE_FULL_SCALE, 2, size)(mapData)

  setTexture(textures.skybox.top, mapData)
  floor({ type: 'absolute', coords: [x, y - size / 2, z] }, 'ceiling', TEXTURE_FULL_SCALE, 0, size)(mapData)

  unsetPolygonGroup(mapData)

  return mapData
}

export default skybox
