import { MapData, move, setColor, setTexture } from '../../../helpers'
import { createWall } from '../wall'
import { createDoor } from '../door'
import { surface, uvFitToHeight } from '../../../prefabs/base/surface'
import { textures } from '../../../assets/textures'
import { RelativeCoords } from '../../../types'

export const createGateArea = async (mapData: MapData) => {
  const wallLength = 1600
  const wallPos: RelativeCoords = { type: 'relative', coords: [-wallLength / 2 - 200, 0, 500] }
  const holeOffset: number = wallLength / 2 - 150
  const wallThickness = 800

  setColor('#515151', mapData)
  setTexture(textures.ground.mossBorder, mapData)
  surface(
    { type: 'relative', coords: move(holeOffset + 200 - 25, 0, 0, wallPos.coords) },
    [200, 200],
    {
      a: 90,
      b: 0,
      g: -90,
    },
    uvFitToHeight([200, 200]),
    [0, 0],
  )(mapData)

  setTexture(textures.ground.rock, mapData)
  surface(
    { type: 'relative', coords: move(holeOffset + 200 - 25, 0, 200, wallPos.coords) },
    [wallThickness - 400, 200],
    {
      a: 90,
      b: 0,
      g: -90,
    },
    uvFitToHeight([wallThickness - 400, 200]),
  )(mapData)

  setTexture(textures.ground.mossBorder, mapData)
  surface(
    { type: 'relative', coords: move(holeOffset - 25, 0, wallThickness, wallPos.coords) },
    [200, 200],
    {
      a: 90,
      b: 0,
      g: 90,
    },
    uvFitToHeight([200, 200]),
    [0, 0],
  )(mapData)

  createWall(wallPos, [wallLength, wallThickness], holeOffset, [150, 220], mapData)
  createDoor(
    { type: 'relative', coords: move(150, 0, 40, move(holeOffset, 0, 0, wallPos.coords)) },
    { a: 0, b: 270, g: 0 },
  )
  createDoor(
    { type: 'relative', coords: move(150, 0, wallThickness - 40, move(holeOffset, 0, 0, wallPos.coords)) },
    { a: 0, b: 270, g: 0 },
  )
}
