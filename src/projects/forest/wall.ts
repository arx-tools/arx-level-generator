import { textures } from '../../assets/textures'
import { setTexture } from '../../helpers'
import { evenAndRemainder, MapData, move } from '../../helpers'
import { scaleUV, surface, uvFitToHeight, uvFixPercentage } from '../../prefabs/base/surface'
import { RelativeCoords } from '../../types'

const blueSquareHeight = 70
const bricksHeight = 280
const foundationHeight = 40
const doorframeWidth = 10
const topRowHeight = 50

const addFoundation = (
  wallPos: RelativeCoords,
  [width, thickness]: [number, number],
  holeOffset: number,
  [holeWidth, holeHeight]: [number, number],
  mapData: MapData,
) => {
  setTexture(textures.stone.stone[0], mapData)

  surface(
    { type: 'relative', coords: move(0, 0, -10, wallPos.coords) },
    [holeOffset - doorframeWidth, foundationHeight - 10 + 0],
    { a: 0, b: 180, g: 0 },
    uvFixPercentage(200),
  )(mapData)
  surface(
    { type: 'relative', coords: move(0, -(foundationHeight - 10), -10, wallPos.coords) },
    [holeOffset - doorframeWidth, 10 * Math.SQRT2],
    { a: -45, b: 180, g: 0 },
    uvFixPercentage(200),
    [0, -(foundationHeight - 10)],
  )(mapData)

  surface(
    {
      type: 'relative',
      coords: move(holeOffset + holeWidth + doorframeWidth, 0, -10, wallPos.coords),
    },
    [width - holeOffset - holeWidth - doorframeWidth, foundationHeight - 10 + 0],
    { a: 0, b: 180, g: 0 },
    uvFixPercentage(200),
  )(mapData)
  surface(
    {
      type: 'relative',
      coords: move(holeOffset + holeWidth + doorframeWidth, -(foundationHeight - 10), -10, wallPos.coords),
    },
    [width - holeOffset - holeWidth - doorframeWidth, 10 * Math.SQRT2],
    { a: -45, b: 180, g: 0 },
    uvFixPercentage(200),
    [0, -(foundationHeight - 10)],
  )(mapData)

  surface(
    {
      type: 'relative',
      coords: move(holeOffset - doorframeWidth, 0, thickness + 10, wallPos.coords),
    },
    [holeOffset - doorframeWidth, foundationHeight - 10 + 0],
    { a: 0, b: 0, g: 0 },
    uvFixPercentage(200),
  )(mapData)
  surface(
    {
      type: 'relative',
      coords: move(holeOffset - doorframeWidth, -(foundationHeight - 10), thickness + 10, wallPos.coords),
    },
    [holeOffset - doorframeWidth, 10 * Math.SQRT2],
    { a: 45, b: 0, g: 0 },
    uvFixPercentage(200),
    [0, -(foundationHeight - 10)],
  )(mapData)

  surface(
    { type: 'relative', coords: move(width, 0, thickness + 10, wallPos.coords) },
    [width - holeOffset - holeWidth - doorframeWidth, foundationHeight - 10 + 0],
    { a: 0, b: 0, g: 0 },
    uvFixPercentage(200),
  )(mapData)
  surface(
    {
      type: 'relative',
      coords: move(width, -(foundationHeight - 10), thickness + 10, wallPos.coords),
    },
    [width - holeOffset - holeWidth - doorframeWidth, 10 * Math.SQRT2],
    { a: 45, b: 0, g: 0 },
    uvFixPercentage(200),
    [0, -(foundationHeight - 10)],
  )(mapData)
}

const addWall = (
  wallPos: RelativeCoords,
  [width, thickness]: [number, number],
  holeOffset: number,
  [holeWidth, holeHeight]: [number, number],
  mapData: MapData,
) => {
  setTexture(textures.wall.castle, mapData)

  surface(
    { type: 'relative', coords: move(0, -foundationHeight, 0, wallPos.coords) },
    [holeOffset - doorframeWidth, bricksHeight - foundationHeight],
    { a: 0, b: 180, g: 0 },
    uvFixPercentage(200),
  )(mapData)
  surface(
    {
      type: 'relative',
      coords: move(holeOffset - doorframeWidth, -holeHeight - doorframeWidth, 0, wallPos.coords),
    },
    [holeWidth + 2 * doorframeWidth, bricksHeight - holeHeight - doorframeWidth],
    { a: 0, b: 180, g: 0 },
    uvFixPercentage(200),
  )(mapData)
  surface(
    {
      type: 'relative',
      coords: move(holeOffset + holeWidth + doorframeWidth, -foundationHeight, 0, wallPos.coords),
    },
    [width - holeOffset - holeWidth - doorframeWidth, bricksHeight - foundationHeight],
    { a: 0, b: 180, g: 0 },
    uvFixPercentage(200),
  )(mapData)

  surface(
    { type: 'relative', coords: move(width, -foundationHeight, thickness, wallPos.coords) },
    [width - holeOffset - holeWidth - doorframeWidth, bricksHeight - foundationHeight],
    { a: 0, b: 0, g: 0 },
    uvFixPercentage(200),
  )(mapData)
  surface(
    {
      type: 'relative',
      coords: move(holeOffset + holeWidth + doorframeWidth, -holeHeight - doorframeWidth, thickness, wallPos.coords),
    },
    [holeWidth + 2 * doorframeWidth, bricksHeight - holeHeight - doorframeWidth],
    { a: 0, b: 0, g: 0 },
    uvFixPercentage(200),
  )(mapData)
  surface(
    {
      type: 'relative',
      coords: move(holeOffset - doorframeWidth, -foundationHeight, thickness, wallPos.coords),
    },
    [holeOffset - doorframeWidth, bricksHeight - foundationHeight],
    { a: 0, b: 0, g: 0 },
    uvFixPercentage(200),
  )(mapData)
}

const addDoorFrame = (
  wallPos: RelativeCoords,
  [width, thickness]: [number, number],
  holeOffset: number,
  [holeWidth, holeHeight]: [number, number],
  mapData: MapData,
) => {
  setTexture(textures.wood.logs, mapData)

  surface(
    { type: 'relative', coords: move(holeOffset, 0, -doorframeWidth, wallPos.coords) },
    [thickness + 2 * doorframeWidth, holeHeight],
    { a: 0, b: 90, g: 0 },
    () => [400, 400],
    [25, 0],
  )(mapData)
  surface(
    { type: 'relative', coords: move(holeOffset, -holeHeight, -doorframeWidth, wallPos.coords) },
    [thickness + 2 * doorframeWidth, holeWidth],
    { a: -90, b: 0, g: 90 },
    () => [400, 400],
    [25, 0],
  )(mapData)
  surface(
    { type: 'relative', coords: move(holeOffset + holeWidth, 0, thickness + doorframeWidth, wallPos.coords) },
    [thickness + 2 * doorframeWidth, holeHeight],
    { a: 0, b: -90, g: 0 },
    () => [400, 400],
    [25, 0],
  )(mapData)

  surface(
    {
      type: 'relative',
      coords: move(holeOffset - doorframeWidth, -holeHeight - doorframeWidth, -doorframeWidth, wallPos.coords),
    },
    [doorframeWidth, holeWidth + 2 * doorframeWidth],
    { a: 0, b: 180, g: -90 },
    () => [400, 400],
    [25, 0],
  )(mapData)
  surface(
    {
      type: 'relative',
      coords: move(
        holeOffset + holeWidth + doorframeWidth,
        -holeHeight - doorframeWidth,
        thickness + doorframeWidth,
        wallPos.coords,
      ),
    },
    [doorframeWidth, holeWidth + 2 * doorframeWidth],
    { a: 0, b: 0, g: -90 },
    () => [400, 400],
    [25, 0],
  )(mapData)

  surface(
    {
      type: 'relative',
      coords: move(holeOffset - doorframeWidth, -holeHeight - doorframeWidth, 0, wallPos.coords),
    },
    [doorframeWidth, holeWidth + 2 * doorframeWidth],
    { a: -90, b: 180, g: -90 },
    () => [400, 400],
    [25, 0],
  )(mapData)
  surface(
    {
      type: 'relative',
      coords: move(holeOffset + holeWidth + doorframeWidth, -holeHeight - doorframeWidth, thickness, wallPos.coords),
    },
    [doorframeWidth, holeWidth + 2 * doorframeWidth],
    { a: 90, b: 0, g: -90 },
    () => [400, 400],
    [25, 0],
  )(mapData)

  surface(
    { type: 'relative', coords: move(holeOffset - doorframeWidth, 0, -doorframeWidth, wallPos.coords) },
    [doorframeWidth, holeHeight],
    { a: 0, b: 180, g: 0 },
    () => [400, 400],
    [25, 0],
  )(mapData)
  surface(
    { type: 'relative', coords: move(holeOffset + holeWidth, 0, -doorframeWidth, wallPos.coords) },
    [doorframeWidth, holeHeight],
    { a: 0, b: 180, g: 0 },
    () => [400, 400],
    [25, 0],
  )(mapData)

  surface(
    { type: 'relative', coords: move(holeOffset, 0, thickness + doorframeWidth, wallPos.coords) },
    [doorframeWidth, holeHeight],
    { a: 0, b: 0, g: 0 },
    () => [400, 400],
    [25, 0],
  )(mapData)
  surface(
    {
      type: 'relative',
      coords: move(holeOffset + holeWidth + doorframeWidth, 0, thickness + doorframeWidth, wallPos.coords),
    },
    [doorframeWidth, holeHeight],
    { a: 0, b: 0, g: 0 },
    () => [400, 400],
    [25, 0],
  )(mapData)

  surface(
    { type: 'relative', coords: move(holeOffset - doorframeWidth, 0, 0, wallPos.coords) },
    [doorframeWidth, holeHeight],
    { a: 0, b: 270, g: 0 },
    () => [400, 400],
    [25, 0],
  )(mapData)
  surface(
    {
      type: 'relative',
      coords: move(holeOffset + holeWidth + doorframeWidth, 0, -doorframeWidth, wallPos.coords),
    },
    [doorframeWidth, holeHeight],
    { a: 0, b: 90, g: 0 },
    () => [400, 400],
    [25, 0],
  )(mapData)

  surface(
    {
      type: 'relative',
      coords: move(holeOffset - doorframeWidth, 0, thickness + doorframeWidth, wallPos.coords),
    },
    [doorframeWidth, holeHeight],
    { a: 0, b: -90, g: 0 },
    () => [400, 400],
    [25, 0],
  )(mapData)
  surface(
    {
      type: 'relative',
      coords: move(holeOffset + holeWidth + doorframeWidth, 0, thickness, wallPos.coords),
    },
    [doorframeWidth, holeHeight],
    { a: 0, b: 90, g: 0 },
    () => [400, 400],
    [25, 0],
  )(mapData)

  surface(
    {
      type: 'relative',
      coords: move(holeOffset - doorframeWidth, -holeHeight - doorframeWidth, 0, wallPos.coords),
    },
    [doorframeWidth, doorframeWidth],
    { a: 90, b: 270, g: 0 },
    () => [400, 400],
    [25, 0],
  )(mapData)
  surface(
    {
      type: 'relative',
      coords: move(
        holeOffset + holeWidth + doorframeWidth,
        -holeHeight - doorframeWidth,
        -doorframeWidth,
        wallPos.coords,
      ),
    },
    [doorframeWidth, doorframeWidth],
    { a: -90, b: 90, g: 0 },
    () => [400, 400],
    [25, 0],
  )(mapData)

  surface(
    {
      type: 'relative',
      coords: move(
        holeOffset - doorframeWidth,
        -holeHeight - doorframeWidth,
        thickness + doorframeWidth,
        wallPos.coords,
      ),
    },
    [doorframeWidth, doorframeWidth],
    { a: 90, b: -90, g: 0 },
    () => [400, 400],
    [25, 0],
  )(mapData)
  surface(
    {
      type: 'relative',
      coords: move(holeOffset + holeWidth + doorframeWidth, -holeHeight - doorframeWidth, thickness, wallPos.coords),
    },
    [doorframeWidth, doorframeWidth],
    { a: -90, b: 90, g: 0 },
    () => [400, 400],
    [25, 0],
  )(mapData)
}

const addOrnament = (
  wallPos: RelativeCoords,
  [width, thickness]: [number, number],
  holeOffset: number,
  [holeWidth, holeHeight]: [number, number],
  mapData: MapData,
) => {
  setTexture(textures.stone.roof, mapData)

  const [fullBlueSquares, partialBlueSquare] = evenAndRemainder(blueSquareHeight, width)
  for (let i = 0; i < fullBlueSquares; i++) {
    surface(
      { type: 'relative', coords: move(i * blueSquareHeight, -bricksHeight, 0, wallPos.coords) },
      [blueSquareHeight, blueSquareHeight],
      { a: 0, b: 180, g: 0 },
      () => [200, 200],
      [50, 0],
    )(mapData)
  }
  if (partialBlueSquare > 0) {
    surface(
      { type: 'relative', coords: move(fullBlueSquares * blueSquareHeight, -bricksHeight, 0, wallPos.coords) },
      [partialBlueSquare, blueSquareHeight],
      { a: 0, b: 180, g: 0 },
      // scaleUV([200, 200], uvFitToHeight([partialBlueSquare, blueSquareHeight])),
      () => [200, 200],
      [50, 0],
    )(mapData)
  }

  for (let i = 0; i < fullBlueSquares; i++) {
    surface(
      {
        type: 'relative',
        coords: move(width - partialBlueSquare - i * blueSquareHeight, -bricksHeight, thickness, wallPos.coords),
      },
      [blueSquareHeight, blueSquareHeight],
      { a: 0, b: 0, g: 0 },
      () => [200, 200],
      [50, 0],
    )(mapData)
  }
  if (partialBlueSquare > 0) {
    surface(
      { type: 'relative', coords: move(width, -bricksHeight, thickness, wallPos.coords) },
      [partialBlueSquare, blueSquareHeight],
      { a: 0, b: 0, g: 0 },
      // scaleUV([200, 200], uvFitToHeight([partialBlueSquare, blueSquareHeight])),
      () => [200, 200],
      [50 * (partialBlueSquare / blueSquareHeight), 0],
    )(mapData)
  }
}

export const addAboveOrnamentWall = (
  wallPos: RelativeCoords,
  [width, thickness]: [number, number],
  holeOffset: number,
  [holeWidth, holeHeight]: [number, number],
  mapData: MapData,
) => {
  setTexture(textures.wall.castle, mapData)

  surface(
    {
      type: 'relative',
      coords: move(0, -blueSquareHeight - bricksHeight, 0, wallPos.coords),
    },
    [width, topRowHeight],
    { a: 0, b: 180, g: 0 },
    // scaleUV(200, uvFixV(topRowHeight, uvFitToHeight([width, topRowHeight]))),
    () => [200, 200],
  )(mapData)
  surface(
    {
      type: 'relative',
      coords: move(width, -blueSquareHeight - bricksHeight, thickness, wallPos.coords),
    },
    [width, topRowHeight],
    { a: 0, b: 0, g: 0 },
    // scaleUV(200, uvFixV(topRowHeight, uvFitToHeight([width, topRowHeight]))),
    () => [200, 200],
  )(mapData)
}

export const createWall = (
  wallPos: RelativeCoords,
  [width, thickness]: [number, number],
  holeOffset: number,
  [holeWidth, holeHeight]: [number, number],
  mapData: MapData,
) => {
  addFoundation(wallPos, [width, thickness], holeOffset, [holeWidth, holeHeight], mapData)
  addWall(wallPos, [width, thickness], holeOffset, [holeWidth, holeHeight], mapData)
  addDoorFrame(wallPos, [width, thickness], holeOffset, [holeWidth, holeHeight], mapData)
  addOrnament(wallPos, [width, thickness], holeOffset, [holeWidth, holeHeight], mapData)
  addAboveOrnamentWall(wallPos, [width, thickness], holeOffset, [holeWidth, holeHeight], mapData)
}
