import { TEXTURE_CUSTOM_SCALE } from '../../constants'
import { MapData, move } from '../../helpers'
import wallX from '../../prefabs/base/wallX'
import { RelativeCoords } from '../../types'

export const quadX = (pos: RelativeCoords, size: [number, number], mapData: MapData) => {
  const { origin } = mapData.config

  const rotation = 0

  const [surfaceWidth, surfaceHeight] = size
  const [scaleUPercent, scaleVPercent] = [100, 100]
  const [offsetUPercent, offsetVPercent] = [0, 0]

  const numberOfWholeTilesX = Math.floor(surfaceWidth / 100)
  const lastTileWidth = surfaceWidth % 100

  const numberOfWholeTilesY = Math.floor(surfaceHeight / 100)
  const lastTileHeight = surfaceHeight % 100

  let rotateCenterX: number
  let rotateCenterY: number
  let scaleU: number
  let scaleV: number

  scaleU = (scaleUPercent / 100) * (surfaceWidth / 100)
  scaleV = (scaleVPercent / 100) * (surfaceWidth / 100)

  for (let y = 0; y < numberOfWholeTilesY; y++) {
    for (let x = 0; x < numberOfWholeTilesX; x++) {
      // TODO: calculate the rotation origin
      rotateCenterX = 0.5
      rotateCenterY = 0.5

      wallX(
        move(
          0,
          -(numberOfWholeTilesY - 1) * 100 + y * 100 - lastTileHeight - 50,
          50 + x * 100,
          move(...pos.coords, origin.coords),
        ),
        'right',
        TEXTURE_CUSTOM_SCALE,
        rotation,
        [0, 100, 100],
        0,
        null,
        scaleU,
        scaleV,
        (1 / scaleU) * x - offsetUPercent / 100,
        (1 / scaleV) * y - offsetVPercent / 100,
        rotateCenterX,
        rotateCenterY,
      )(mapData)
    }
  }

  // TODO: calculate the rotation origin
  rotateCenterX = 0.5
  rotateCenterY = 0.5
  scaleU = (scaleUPercent / 100) * (surfaceWidth / 100)
  scaleV = ((scaleVPercent / 100) * (surfaceWidth / 100)) / (lastTileHeight / 100)

  for (let x = 0; x < numberOfWholeTilesX; x++) {
    wallX(
      move(0, -lastTileHeight / 2, 50 + x * 100, move(...pos.coords, origin.coords)),
      'right',
      TEXTURE_CUSTOM_SCALE,
      rotation,
      [0, lastTileHeight, 100],
      0,
      null,
      scaleU,
      scaleV,
      (1 / scaleU) * x - offsetUPercent / 100,
      (1 / scaleV) * ((numberOfWholeTilesY * 100) / lastTileHeight) - offsetVPercent / 100,
      rotateCenterX,
      rotateCenterY,
    )(mapData)
  }

  // TODO: calculate the rotation origin
  rotateCenterX = 0.5
  rotateCenterY = 0.5
  scaleU = ((scaleUPercent / 100) * (surfaceWidth / 100)) / (lastTileWidth / 100)
  scaleV = (scaleVPercent / 100) * (surfaceWidth / 100)

  for (let y = 0; y < numberOfWholeTilesY; y++) {
    wallX(
      move(
        0,
        -(numberOfWholeTilesY - 1) * 100 + y * 100 - lastTileHeight - 50,
        lastTileWidth / 2 + numberOfWholeTilesX * 100,
        move(...pos.coords, origin.coords),
      ),
      'right',
      TEXTURE_CUSTOM_SCALE,
      rotation,
      [0, 100, lastTileWidth],
      0,
      null,
      scaleU,
      scaleV,
      (1 / scaleU) * ((numberOfWholeTilesX * 100) / lastTileWidth) - offsetUPercent / 100,
      (1 / scaleV) * y - offsetVPercent / 100,
      rotateCenterX,
      rotateCenterY,
    )(mapData)
  }

  // TODO: calculate the rotation origin
  rotateCenterX = 0.5
  rotateCenterY = 0.5
  scaleU = ((scaleUPercent / 100) * (surfaceWidth / 100)) / (lastTileWidth / 100)
  scaleV = ((scaleVPercent / 100) * (surfaceWidth / 100)) / (lastTileHeight / 100)

  wallX(
    move(0, -lastTileHeight / 2, lastTileWidth / 2 + numberOfWholeTilesX * 100, move(...pos.coords, origin.coords)),
    'right',
    TEXTURE_CUSTOM_SCALE,
    rotation,
    [0, lastTileHeight, lastTileWidth],
    0,
    null,
    scaleU,
    scaleV,
    (1 / scaleU) * ((numberOfWholeTilesX * 100) / lastTileWidth) - offsetUPercent / 100,
    (1 / scaleV) * ((numberOfWholeTilesY * 100) / lastTileHeight) - offsetVPercent / 100,
    rotateCenterX,
    rotateCenterY,
  )(mapData)
}
