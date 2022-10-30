import { textures } from '../../../assets/textures'
import { identity } from '../../../faux-ramda'
import { addLight, MapData, pickRandom, setColor, setTexture } from '../../../helpers'
import { plain } from '../../../prefabs/plain'
import {
  HFLIP,
  TEXTURE_QUAD_BOTTOM_LEFT,
  TEXTURE_QUAD_BOTTOM_RIGHT,
  TEXTURE_QUAD_TOP_LEFT,
  TEXTURE_QUAD_TOP_RIGHT,
  VFLIP,
} from '../../../constants'

const addHubFloor = (mapData: MapData) => {
  setColor('#515151', mapData)
  setTexture(textures.ground.moss, mapData)
  plain([-200, 0, 1800], [16, 12], 'floor', identity, () => ({
    quad: pickRandom([
      TEXTURE_QUAD_TOP_LEFT,
      TEXTURE_QUAD_TOP_RIGHT,
      TEXTURE_QUAD_BOTTOM_LEFT,
      TEXTURE_QUAD_BOTTOM_RIGHT,
    ]),
    textureRotation: pickRandom([0, 90, 180, 270]),
    textureFlags: pickRandom([0, HFLIP, VFLIP, HFLIP | VFLIP]),
  }))(mapData)
}

export const createHub = async (mapData: MapData) => {
  addHubFloor(mapData)

  setColor('white', mapData)
  addLight([0, -1000, 2000], { fallstart: 1, fallend: 3000, intensity: 5 }, mapData)
}
