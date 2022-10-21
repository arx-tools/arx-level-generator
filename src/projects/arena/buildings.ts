import { textures } from '../../assets/textures'
import { HFLIP, VFLIP } from '../../constants'
import { isBetween, MapData, move, setTexture } from '../../helpers'
import wallX from '../../prefabs/base/wallX'
import wallZ from '../../prefabs/base/wallZ'
import floor from '../../prefabs/base/floor'
import { RelativeCoords } from '../../types'

/*
const calculateUV = (quad = null, textureRotation = 0, flags = 0) => {
  let texU = 0
  let texV = 0
  const _uv = {
    a: { u: 1, v: 0 },
    b: { u: 1, v: 1 },
    c: { u: 0, v: 0 },
    d: { u: 0, v: 1 },
  }

  let a = { u: 0.5, v: 0 }
  let b = { u: 0.5, v: 0.5 }
  let c = { u: 0, v: 0 }
  let d = { u: 0, v: 0.5 }

  if (quad === null) {
    a = _uv.a
    b = _uv.b
    c = _uv.c
    d = _uv.d
  } else {
    switch (quad) {
      case 0:
        texU = 0
        texV = 0
        break
      case 1:
        texU = 0.5
        texV = 0
        break
      case 2:
        texU = 0.5
        texV = 0.5
        break
      case 3:
        texU = 0
        texV = 0.5
        break
    }
  }

  let uv = rotateUV(textureRotation, [c, d, a, b])

  if (flags & HFLIP) {
    uv = flipUVHorizontally(uv)
  }

  if (flags & VFLIP) {
    uv = flipUVVertically(uv)
  }

  return uv
}
*/

/*
const stoneWallZ = (pos, width, height, mapData) => {
  setTexture(textures.stone.humanWall1, mapData)

  for (let h = 0; h < height; h++) {
    for (let w = 0; w < width; w++) {
      wallZ(move(50 + w * 100, -50 - h * 100, 50, pos), 'back', null, 0)(mapData)
    }
  }
}
*/

export const house = (pos: RelativeCoords, mapData: MapData) => {
  const { origin } = mapData.config

  /*
  stoneWallZ(move(...pos, origin.coords), 3, 3, mapData)

  for (let offsetX = 0; offsetX < 3; offsetX++) {
    
    wallZ(
      move(x + offsetX * 100, y - 50, z, origin.coords),
      'back',
      null,
      0,
    )(mapData)
    wallZ(
      move(x + offsetX * 100, y - 150, z, origin.coords),
      'back',
      null,
      0,
    )(mapData)

    setTexture(textures.wood.logs, mapData)
    floor(
      {
        type: 'absolute',
        coords: move(x + offsetX * 100, y - 200, z - 75, origin.coords),
      },
      'ceiling',
      null,
      0,
      [100, 0, 50],
      0,
      {
        a: { u: 0.95, v: 0.1 },
        b: { u: 0.95, v: 0.9 },
        c: { u: 0.75, v: 0.1 },
        d: { u: 0.75, v: 0.9 },
      },
    )(mapData)
    floor(
      {
        type: 'absolute',
        coords: move(x + offsetX * 100, y - 210, z - 90, origin.coords),
      },
      'top',
      null,
      0,
      [100, 0, 20],
      0,
      {
        a: { u: 0.95, v: 0.1 },
        b: { u: 0.95, v: 0.9 },
        c: { u: 0.75, v: 0.1 },
        d: { u: 0.75, v: 0.9 },
      },
    )(mapData)
    wallZ(
      move(x + offsetX * 100, y - 205, z - 100, origin.coords),
      'back',
      null,
      270,
      [100, 10, 0],
      0,
      {
        a: { u: 0.95, v: 0.1 },
        b: { u: 0.95, v: 0.9 },
        c: { u: 0.75, v: 0.1 },
        d: { u: 0.75, v: 0.9 },
      },
    )(mapData)

    setTexture(textures.wall.roughcast[0], mapData)
    wallZ(
      move(x + offsetX * 100, y - 260, z - 30, origin.coords),
      'back',
      offsetX % 4 === 0 || offsetX % 4 === 3 ? 3 : 2,
      0,
      100,
      offsetX % 4 < 2 ? 0 : HFLIP,
    )(mapData)
    wallZ(
      move(x + offsetX * 100, y - 360, z - 30, origin.coords),
      'back',
      offsetX % 4 === 0 || offsetX % 4 === 3 ? 0 : 1,
      0,
      100,
      offsetX % 4 < 2 ? 0 : HFLIP,
    )(mapData)
  }
  */
}
