import { textures } from '../../assets/textures'
import {
  TEXTURE_CUSTOM_SCALE,
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

  // TODO: rotate around a fix point
  const rotate = 0

  wallX(move(0, -50, 0, move(...pos.coords, origin.coords)), 'right', TEXTURE_FULL_SCALE, rotate)(mapData)

  wallX(move(0, -50, -200, move(...pos.coords, origin.coords)), 'right', TEXTURE_QUAD_BOTTOM_RIGHT, rotate)(mapData)
  wallX(move(0, -50, -300, move(...pos.coords, origin.coords)), 'right', TEXTURE_QUAD_BOTTOM_LEFT, rotate)(mapData)
  wallX(move(0, -150, -200, move(...pos.coords, origin.coords)), 'right', TEXTURE_QUAD_TOP_RIGHT, rotate)(mapData)
  wallX(move(0, -150, -300, move(...pos.coords, origin.coords)), 'right', TEXTURE_QUAD_TOP_LEFT, rotate)(mapData)

  const scaleU = 5
  const scaleV = 10
  for (let y = 0; y < scaleV; y++) {
    for (let x = 0; x < scaleU; x++) {
      wallX(
        move(
          0,
          -50 - (scaleV - 1) * 100 + y * 100,
          -500 - (scaleU - 1) * 100 + x * 100,
          move(...pos.coords, origin.coords),
        ),
        'right',
        TEXTURE_CUSTOM_SCALE,
        rotate,
        100,
        0,
        null,
        scaleU,
        scaleV,
        (1 / scaleU) * x,
        (1 / scaleV) * y,
      )(mapData)
    }
  }
}
