import { textures } from '../../assets/textures'
import { setTexture } from '../../helpers'
import { evenAndRemainder, MapData, move } from '../../helpers'
import { surface } from '../../prefabs/base/surface'
import { RelativeCoords } from '../../types'
import { addDoor } from './addDoor'

export const addWall = ({ coords }: RelativeCoords, [width, thickness]: [number, number], mapData: MapData) => {
  const doorPos: RelativeCoords = { type: 'relative', coords: [250, 0, thickness / 2] }
  const [doorWidth, doorHeight] = [150, 220]

  const blueSquareHeight = 70
  const bricksHeight = 280
  const foundationHeight = 40
  const doorframeWidth = 10

  addDoor({ type: 'relative', coords: move(doorWidth, 0, 0, move(...doorPos.coords, coords)) }, { a: 0, b: 270, g: 0 })

  setTexture(textures.stone.stone[0], mapData)

  surface(
    { type: 'relative', coords: move(0, 0, -10, coords) },
    [doorPos.coords[0] - doorframeWidth, foundationHeight - 10],
    { a: 0, b: 180, g: 0 },
    [100, 100],
  )(mapData)
  surface(
    { type: 'relative', coords: move(0, -(foundationHeight - 10), -10, coords) },
    [doorPos.coords[0] - doorframeWidth, 10 * Math.SQRT2],
    { a: -45, b: 180, g: 0 },
    [100, 100],
    [0, -(foundationHeight - 10)],
  )(mapData)

  surface(
    { type: 'relative', coords: move(doorPos.coords[0] + doorWidth + doorframeWidth, 0, -10, coords) },
    [width - doorPos.coords[0] - doorWidth - doorframeWidth, foundationHeight - 10],
    { a: 0, b: 180, g: 0 },
    [100, 100],
  )(mapData)
  surface(
    {
      type: 'relative',
      coords: move(doorPos.coords[0] + doorWidth + doorframeWidth, -(foundationHeight - 10), -10, coords),
    },
    [width - doorPos.coords[0] - doorWidth - doorframeWidth, 10 * Math.SQRT2],
    { a: -45, b: 180, g: 0 },
    [100, 100],
    [0, -(foundationHeight - 10)],
  )(mapData)

  surface(
    {
      type: 'relative',
      coords: move(doorPos.coords[0] - doorframeWidth, 0, thickness + 10, coords),
    },
    [doorPos.coords[0] - doorframeWidth, foundationHeight - 10],
    { a: 0, b: 0, g: 0 },
    [100, 100],
  )(mapData)
  surface(
    {
      type: 'relative',
      coords: move(doorPos.coords[0] - doorframeWidth, -(foundationHeight - 10), thickness + 10, coords),
    },
    [doorPos.coords[0] - doorframeWidth, 10 * Math.SQRT2],
    { a: 45, b: 0, g: 0 },
    [100, 100],
    [0, -(foundationHeight - 10)],
  )(mapData)

  surface(
    { type: 'relative', coords: move(width, 0, thickness + 10, coords) },
    [width - doorPos.coords[0] - doorWidth - doorframeWidth, foundationHeight - 10],
    { a: 0, b: 0, g: 0 },
    [100, 100],
  )(mapData)
  surface(
    {
      type: 'relative',
      coords: move(width, -(foundationHeight - 10), thickness + 10, coords),
    },
    [width - doorPos.coords[0] - doorWidth - doorframeWidth, 10 * Math.SQRT2],
    { a: 45, b: 0, g: 0 },
    [100, 100],
    [0, -(foundationHeight - 10)],
  )(mapData)

  // --------------------------

  setTexture(textures.wall.castle, mapData)

  surface(
    { type: 'relative', coords: move(0, -foundationHeight, 0, coords) },
    [doorPos.coords[0] - doorframeWidth, bricksHeight - foundationHeight],
    { a: 0, b: 180, g: 0 },
    [100, 100],
  )(mapData)
  surface(
    { type: 'relative', coords: move(doorPos.coords[0] - doorframeWidth, -doorHeight - doorframeWidth, 0, coords) },
    [doorWidth + 2 * doorframeWidth, bricksHeight - doorHeight - doorframeWidth],
    { a: 0, b: 180, g: 0 },
    [100, 100],
  )(mapData)
  surface(
    { type: 'relative', coords: move(doorPos.coords[0] + doorWidth + doorframeWidth, -foundationHeight, 0, coords) },
    [width - doorPos.coords[0] - doorWidth - doorframeWidth, bricksHeight - foundationHeight],
    { a: 0, b: 180, g: 0 },
    [100, 100],
  )(mapData)

  surface(
    { type: 'relative', coords: move(width, -foundationHeight, thickness, coords) },
    [width - doorPos.coords[0] - doorWidth - doorframeWidth, bricksHeight - foundationHeight],
    { a: 0, b: 0, g: 0 },
    [100, 100],
  )(mapData)
  surface(
    {
      type: 'relative',
      coords: move(doorPos.coords[0] + doorWidth + doorframeWidth, -doorHeight - doorframeWidth, thickness, coords),
    },
    [doorWidth + 2 * doorframeWidth, bricksHeight - doorHeight - doorframeWidth],
    { a: 0, b: 0, g: 0 },
    [100, 100],
  )(mapData)
  surface(
    { type: 'relative', coords: move(doorPos.coords[0] - doorframeWidth, -foundationHeight, thickness, coords) },
    [doorPos.coords[0] - doorframeWidth, bricksHeight - foundationHeight],
    { a: 0, b: 0, g: 0 },
    [100, 100],
  )(mapData)

  // --------------------------

  setTexture(textures.wood.logs, mapData)

  surface(
    { type: 'relative', coords: move(doorPos.coords[0], 0, -doorframeWidth, coords) },
    [thickness + 2 * doorframeWidth, doorHeight],
    { a: 0, b: 90, g: 0 },
    [400, 400],
    [25, 0],
  )(mapData)
  surface(
    { type: 'relative', coords: move(doorPos.coords[0], -doorHeight, -doorframeWidth, coords) },
    [thickness + 2 * doorframeWidth, doorWidth],
    { a: -90, b: 0, g: 90 },
    [400, 400],
    [25, 0],
  )(mapData)
  surface(
    { type: 'relative', coords: move(doorPos.coords[0] + doorWidth, 0, thickness + doorframeWidth, coords) },
    [thickness + 2 * doorframeWidth, doorHeight],
    { a: 0, b: -90, g: 0 },
    [400, 400],
    [25, 0],
  )(mapData)

  surface(
    {
      type: 'relative',
      coords: move(doorPos.coords[0] - doorframeWidth, -doorHeight - doorframeWidth, -doorframeWidth, coords),
    },
    [doorframeWidth, doorWidth + 2 * doorframeWidth],
    { a: 0, b: 180, g: -90 },
    [400, 400],
    [25, 0],
  )(mapData)
  surface(
    {
      type: 'relative',
      coords: move(
        doorPos.coords[0] + doorWidth + doorframeWidth,
        -doorHeight - doorframeWidth,
        thickness + doorframeWidth,
        coords,
      ),
    },
    [doorframeWidth, doorWidth + 2 * doorframeWidth],
    { a: 0, b: 0, g: -90 },
    [400, 400],
    [25, 0],
  )(mapData)

  surface(
    {
      type: 'relative',
      coords: move(doorPos.coords[0] - doorframeWidth, -doorHeight - doorframeWidth, 0, coords),
    },
    [doorframeWidth, doorWidth + 2 * doorframeWidth],
    { a: -90, b: 180, g: -90 },
    [400, 400],
    [25, 0],
  )(mapData)
  surface(
    {
      type: 'relative',
      coords: move(doorPos.coords[0] + doorWidth + doorframeWidth, -doorHeight - doorframeWidth, thickness, coords),
    },
    [doorframeWidth, doorWidth + 2 * doorframeWidth],
    { a: 90, b: 0, g: -90 },
    [400, 400],
    [25, 0],
  )(mapData)

  surface(
    { type: 'relative', coords: move(doorPos.coords[0] - doorframeWidth, 0, -doorframeWidth, coords) },
    [doorframeWidth, doorHeight],
    { a: 0, b: 180, g: 0 },
    [400, 400],
    [25, 0],
  )(mapData)
  surface(
    { type: 'relative', coords: move(doorPos.coords[0] + doorWidth, 0, -doorframeWidth, coords) },
    [doorframeWidth, doorHeight],
    { a: 0, b: 180, g: 0 },
    [400, 400],
    [25, 0],
  )(mapData)

  surface(
    { type: 'relative', coords: move(doorPos.coords[0], 0, thickness + doorframeWidth, coords) },
    [doorframeWidth, doorHeight],
    { a: 0, b: 0, g: 0 },
    [400, 400],
    [25, 0],
  )(mapData)
  surface(
    {
      type: 'relative',
      coords: move(doorPos.coords[0] + doorWidth + doorframeWidth, 0, thickness + doorframeWidth, coords),
    },
    [doorframeWidth, doorHeight],
    { a: 0, b: 0, g: 0 },
    [400, 400],
    [25, 0],
  )(mapData)

  surface(
    { type: 'relative', coords: move(doorPos.coords[0] - doorframeWidth, 0, 0, coords) },
    [doorframeWidth, doorHeight],
    { a: 0, b: 270, g: 0 },
    [400, 400],
    [25, 0],
  )(mapData)
  surface(
    { type: 'relative', coords: move(doorPos.coords[0] + doorWidth + doorframeWidth, 0, -doorframeWidth, coords) },
    [doorframeWidth, doorHeight],
    { a: 0, b: 90, g: 0 },
    [400, 400],
    [25, 0],
  )(mapData)

  surface(
    { type: 'relative', coords: move(doorPos.coords[0] - doorframeWidth, 0, thickness + doorframeWidth, coords) },
    [doorframeWidth, doorHeight],
    { a: 0, b: -90, g: 0 },
    [400, 400],
    [25, 0],
  )(mapData)
  surface(
    {
      type: 'relative',
      coords: move(doorPos.coords[0] + doorWidth + doorframeWidth, 0, thickness, coords),
    },
    [doorframeWidth, doorHeight],
    { a: 0, b: 90, g: 0 },
    [400, 400],
    [25, 0],
  )(mapData)

  surface(
    { type: 'relative', coords: move(doorPos.coords[0] - doorframeWidth, -doorHeight - doorframeWidth, 0, coords) },
    [doorframeWidth, doorframeWidth],
    { a: 90, b: 270, g: 0 },
    [400, 400],
    [25, 0],
  )(mapData)
  surface(
    {
      type: 'relative',
      coords: move(
        doorPos.coords[0] + doorWidth + doorframeWidth,
        -doorHeight - doorframeWidth,
        -doorframeWidth,
        coords,
      ),
    },
    [doorframeWidth, doorframeWidth],
    { a: -90, b: 90, g: 0 },
    [400, 400],
    [25, 0],
  )(mapData)

  surface(
    {
      type: 'relative',
      coords: move(
        doorPos.coords[0] - doorframeWidth,
        -doorHeight - doorframeWidth,
        thickness + doorframeWidth,
        coords,
      ),
    },
    [doorframeWidth, doorframeWidth],
    { a: 90, b: -90, g: 0 },
    [400, 400],
    [25, 0],
  )(mapData)
  surface(
    {
      type: 'relative',
      coords: move(doorPos.coords[0] + doorWidth + doorframeWidth, -doorHeight - doorframeWidth, thickness, coords),
    },
    [doorframeWidth, doorframeWidth],
    { a: -90, b: 90, g: 0 },
    [400, 400],
    [25, 0],
  )(mapData)

  // --------------------------

  setTexture(textures.stone.roof, mapData)

  const [fullBlueSquares, partialBlueSquare] = evenAndRemainder(blueSquareHeight, width)
  for (let i = 0; i < fullBlueSquares; i++) {
    surface(
      { type: 'relative', coords: move(i * blueSquareHeight, -bricksHeight, 0, coords) },
      [blueSquareHeight, blueSquareHeight],
      { a: 0, b: 180, g: 0 },
      [200, 200],
      [50, 0],
    )(mapData)
  }
  if (partialBlueSquare > 0) {
    surface(
      { type: 'relative', coords: move(fullBlueSquares * blueSquareHeight, -bricksHeight, 0, coords) },
      [partialBlueSquare, blueSquareHeight],
      { a: 0, b: 180, g: 0 },
      [200 / (partialBlueSquare / blueSquareHeight), 200 / (partialBlueSquare / blueSquareHeight)],
      [50, 0],
    )(mapData)
  }

  for (let i = 0; i < fullBlueSquares; i++) {
    surface(
      {
        type: 'relative',
        coords: move(width - partialBlueSquare - i * blueSquareHeight, -bricksHeight, thickness, coords),
      },
      [blueSquareHeight, blueSquareHeight],
      { a: 0, b: 0, g: 0 },
      [200, 200],
      [50, 0],
    )(mapData)
  }
  if (partialBlueSquare > 0) {
    surface(
      { type: 'relative', coords: move(width, -bricksHeight, thickness, coords) },
      [partialBlueSquare, blueSquareHeight],
      { a: 0, b: 0, g: 0 },
      [200 / (partialBlueSquare / blueSquareHeight), 200 / (partialBlueSquare / blueSquareHeight)],
      [50 * (partialBlueSquare / blueSquareHeight), 0],
    )(mapData)
  }
}
