import { textures } from '../../assets/textures'
import {
  TEXTURE_FULL_SCALE,
  TEXTURE_QUAD_BOTTOM_LEFT,
  TEXTURE_QUAD_BOTTOM_RIGHT,
  TEXTURE_QUAD_TOP_LEFT,
  TEXTURE_QUAD_TOP_RIGHT,
} from '../../constants'
import { MapData, move, setTexture } from '../../helpers'
import wallX from '../../prefabs/base/wallX'
import { RelativeCoords } from '../../types'

export const house = (pos: RelativeCoords, mapData: MapData) => {
  const { origin } = mapData.config

  setTexture(textures.wall.roughcast[0], mapData)
  wallX(move(0, -50, 0, move(...pos.coords, origin.coords)), 'right', TEXTURE_FULL_SCALE, 0)(mapData)

  wallX(move(0, -50, -200, move(...pos.coords, origin.coords)), 'right', TEXTURE_QUAD_BOTTOM_RIGHT, 0)(mapData)
  wallX(move(0, -50, -300, move(...pos.coords, origin.coords)), 'right', TEXTURE_QUAD_BOTTOM_LEFT, 0)(mapData)
  wallX(move(0, -150, -200, move(...pos.coords, origin.coords)), 'right', TEXTURE_QUAD_TOP_RIGHT, 0)(mapData)
  wallX(move(0, -150, -300, move(...pos.coords, origin.coords)), 'right', TEXTURE_QUAD_TOP_LEFT, 0)(mapData)
}
