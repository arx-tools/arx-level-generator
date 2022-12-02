import wallX from './base/wallX'
import wallZ from './base/wallZ'
import { HFLIP, TEXTURE_CUSTOM_UV } from '../constants'
import { Vector3 } from '../types'
import { MapData } from '../helpers'

const segment = ([x, y, z]: Vector3, size: number, mapData: MapData) => {
  const height = 500

  const uv = {
    a: { u: 0.51, v: 0 },
    b: { u: 0.51, v: 1 },
    c: { u: 0.49, v: 0 },
    d: { u: 0.49, v: 1 },
  }

  wallX([x - size / 2, y, z - size / 2], 'left', TEXTURE_CUSTOM_UV, 0, [size, height, size], 0, uv)(mapData)
  wallX([x + size / 2, y, z - size / 2], 'right', TEXTURE_CUSTOM_UV, 0, [size, height, size], HFLIP, uv)(mapData)
  wallZ([x - size / 2, y, z - size / 2], 'back', TEXTURE_CUSTOM_UV, 0, [size, height, size], 0, uv)(mapData)
  wallZ([x - size / 2, y, z + size / 2], 'front', TEXTURE_CUSTOM_UV, 0, [size, height, size], HFLIP, uv)(mapData)
}

const pillar = ([x, y, z]: Vector3, diameter: number, mapData: MapData) => {
  for (let i = -10; i < 10; i++) {
    segment([x, y + i * 500, z], diameter, mapData)
  }
}

export default pillar
