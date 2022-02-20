const { times, repeat, clamp, curry, flatten, uniq, pathEq } = require("ramda");
const { textures } = require("../../assets/textures.js");
const { HFLIP, VFLIP } = require("../../constants.js");
const { setTexture, pickRandom, move } = require("../../helpers.js");
const { plain, disableBumping } = require("../../prefabs/plain.js");
const { UNIT } = require("./constants.js");
const { wall } = require("./wall.js");

const getRadius = (grid) => (grid.length - 1) / 2;

const insertRoom = (left, top, width, height, grid) => {
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      grid[top + y][left + x] = 1;
    }
  }

  return grid;
};

const addFirstRoom = (width, height, grid) => {
  const radius = getRadius(grid);

  width = clamp(1, radius * 2 + 1, width);
  height = clamp(1, radius * 2 + 1, height);

  const left = radius - Math.floor(width / 2);
  const top = radius - Math.floor(height / 2);

  return insertRoom(left, top, width, height, grid);
};

// is every cell of the grid === 0 ?
const isEmpty = (grid) => {
  const elementsInGrid = uniq(flatten(grid));
  return elementsInGrid.length === 1 && elementsInGrid[0] === 0;
};

// is the X/Y position of the grid === 1 ?
const isOccupied = (x, y, grid) => {
  if (typeof grid[y] === "undefined") {
    return null;
  }
  if (typeof grid[y][x] === "undefined") {
    return null;
  }

  return grid[y][x] === 1;
};

// starting from left/top does a width/height sized rectangle only occupy 0 slots?
const canFitRoom = (left, top, width, height, grid) => {
  for (let y = top; y < top + height; y++) {
    for (let x = left; x < left + width; x++) {
      if (isOccupied(x, y, grid) !== false) {
        return false;
      }
    }
  }

  return true;
};

// is there a variation of a width/height sized rectangle containing the position x/y which
// can occupy only 0 slots?
const canFitRoomAtPos = (x, y, width, height, grid) => {
  for (let j = 0; j < height; j++) {
    for (let i = 0; i < width; i++) {
      if (canFitRoom(x - i, y - j, width, height, grid)) {
        return true;
      }
    }
  }

  return false;
};

// is the x/y slot surrounded by at least 1 slot containing 1? (north/south/east/west, no diagonals)
const isConnected = (x, y, grid) => {
  return (
    isOccupied(x - 1, y, grid) ||
    isOccupied(x + 1, y, grid) ||
    isOccupied(x, y - 1, grid) ||
    isOccupied(x, y + 1, grid)
  );
};

const getFittingVariants = (x, y, width, height, grid) => {
  const variations = [];

  for (let j = 0; j < height; j++) {
    for (let i = 0; i < width; i++) {
      if (canFitRoom(x - i, y - j, width, height, grid)) {
        variations.push([x - i, y - j]);
      }
    }
  }

  return variations;
};

const generateGrid = (size) => {
  if (size % 2 === 0) {
    size++;
  }

  return times(() => repeat(0, size), size);
};

const addRoom = curry((width, height, grid) => {
  if (isEmpty(grid)) {
    return addFirstRoom(width, height, grid);
  }

  let candidates = [];

  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      if (grid[y][x] !== 1) {
        if (isConnected(x, y, grid)) {
          candidates.push([x, y]);
        }
      }
    }
  }

  candidates = candidates.filter(([x, y]) => {
    return canFitRoomAtPos(x, y, width, height, grid);
  });

  if (!candidates.length) {
    return grid;
  }

  const candidate = pickRandom(candidates);

  const variants = getFittingVariants(
    candidate[0],
    candidate[1],
    width,
    height,
    grid
  );

  const startingPos = pickRandom(variants);

  return insertRoom(startingPos[0], startingPos[1], width, height, grid);
});

const decalOffset = {
  right: [1, 0, 0],
  left: [-1, 0, 0],
  front: [0, 0, 1],
  back: [0, 0, -1],
};

const getRightWalls = (wallSegments) => {
  return wallSegments
    .filter(([x, y, direction]) => direction === "right")
    .sort(([ax, ay], [bx, by]) => ax - bx || ay - by)
    .reduce((walls, [x, y]) => {
      const adjacentWallIdx = walls.findIndex(
        (wall) => wall.x === x && wall.y + wall.width === y
      );

      if (adjacentWallIdx !== -1) {
        walls[adjacentWallIdx].width += 1;
        return walls;
      }

      walls.push({ x, y, width: 1 });

      return walls;
    }, []);
};

const getLeftWalls = (wallSegments) => {
  return wallSegments
    .filter(([x, y, direction]) => direction === "left")
    .sort(([ax, ay], [bx, by]) => ax - bx || ay - by)
    .reduce((walls, [x, y]) => {
      const adjacentWallIdx = walls.findIndex(
        (wall) => wall.x === x && wall.y + wall.width === y
      );

      if (adjacentWallIdx !== -1) {
        walls[adjacentWallIdx].width += 1;
        return walls;
      }

      walls.push({ x, y, width: 1 });

      return walls;
    }, []);
};

const getFrontWalls = (wallSegments) => {
  return wallSegments
    .filter(([x, y, direction]) => direction === "front")
    .sort(([ax, ay], [bx, by]) => ay - by || ax - bx)
    .reduce((walls, [x, y]) => {
      const adjacentWallIdx = walls.findIndex(
        (wall) => wall.y === y && wall.x + wall.width === x
      );

      if (adjacentWallIdx !== -1) {
        walls[adjacentWallIdx].width += 1;
        return walls;
      }

      walls.push({ x, y, width: 1 });

      return walls;
    }, []);
};

const getBackWalls = (wallSegments) => {
  return wallSegments
    .filter(([x, y, direction]) => direction === "back")
    .sort(([ax, ay], [bx, by]) => ay - by || ax - bx)
    .reduce((walls, [x, y]) => {
      const adjacentWallIdx = walls.findIndex(
        (wall) => wall.y === y && wall.x + wall.width === x
      );

      if (adjacentWallIdx !== -1) {
        walls[adjacentWallIdx].width += 1;
        return walls;
      }

      walls.push({ x, y, width: 1 });

      return walls;
    }, []);
};

const renderGrid = (grid) => {
  return (mapData) => {
    const { roomDimensions } = mapData.config;
    const radius = getRadius(grid);
    const top = -radius * UNIT + UNIT / 2;
    const left = -radius * UNIT + UNIT / 2;

    const wallSegments = [];

    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[y].length; x++) {
        if (grid[y][x] === 1) {
          if (isOccupied(x - 1, y, grid) !== true) {
            wallSegments.push([x, y, "right"]);
          }
          if (isOccupied(x + 1, y, grid) !== true) {
            wallSegments.push([x, y, "left"]);
          }
          if (isOccupied(x, y + 1, grid) !== true) {
            wallSegments.push([x, y, "front"]);
          }
          if (isOccupied(x, y - 1, grid) !== true) {
            wallSegments.push([x, y, "back"]);
          }
        }
      }
    }

    const rightWalls = getRightWalls(wallSegments);
    const leftWalls = getLeftWalls(wallSegments);
    const frontWalls = getFrontWalls(wallSegments);
    const backWalls = getBackWalls(wallSegments);

    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[y].length; x++) {
        if (grid[y][x] === 1) {
          setTexture(textures.backrooms.carpetDirty, mapData);
          plain(
            [left + x * UNIT, 0, -(top + y * UNIT)],
            [UNIT / 100, UNIT / 100],
            "floor",
            disableBumping,
            {
              textureRotation: pickRandom([0, 90, 180, 270]),
              textureFlags: pickRandom([0, HFLIP, VFLIP, HFLIP | VFLIP]),
            }
          )(mapData);

          setTexture(textures.backrooms.ceiling, mapData);
          plain(
            [
              left + x * UNIT,
              -(UNIT * roomDimensions.height),
              -(top + y * UNIT),
            ],
            [UNIT / 100, UNIT / 100],
            "ceiling",
            disableBumping
          )(mapData);
        }
      }
    }

    rightWalls.forEach(({ x, y, width }) => {
      const coords = [
        left + x * UNIT - UNIT / 2,
        0,
        -(top + (y + width) * UNIT) - UNIT / 2,
      ];
      setTexture(
        textures.backrooms[Math.random() > 0.5 ? "wall" : "wall2"],
        mapData
      );
      wall(coords, "right", { width })(mapData);
      setTexture(textures.backrooms.moldEdge, mapData);
      wall(move(...decalOffset.right, coords), "right", { height: 1, width })(
        mapData
      );
    });

    leftWalls.forEach(({ x, y, width }) => {
      const coords = [
        left + x * UNIT + UNIT / 2,
        0,
        -(top + (y + width) * UNIT) - UNIT / 2,
      ];
      setTexture(
        textures.backrooms[Math.random() > 0.5 ? "wall" : "wall2"],
        mapData
      );
      wall(coords, "left", { width })(mapData);
      setTexture(textures.backrooms.moldEdge, mapData);
      wall(move(...decalOffset.left, coords), "left", { height: 1, width })(
        mapData
      );
    });

    frontWalls.forEach(({ x, y, width }) => {
      const coords = [
        left + (x - 1) * UNIT - UNIT / 2,
        0,
        -(top + y * UNIT) - UNIT / 2,
      ];
      setTexture(
        textures.backrooms[Math.random() > 0.5 ? "wall" : "wall2"],
        mapData
      );
      wall(coords, "front", { width })(mapData);
      setTexture(textures.backrooms.moldEdge, mapData);
      wall(move(...decalOffset.front, coords), "front", { height: 1, width })(
        mapData
      );
    });

    backWalls.forEach(({ x, y, width }) => {
      const coords = [
        left + (x - 1) * UNIT - UNIT / 2,
        0,
        -(top + y * UNIT) + UNIT / 2,
      ];
      setTexture(
        textures.backrooms[Math.random() > 0.5 ? "wall" : "wall2"],
        mapData
      );
      wall(coords, "back", { width })(mapData);
      setTexture(textures.backrooms.moldEdge, mapData);
      wall(move(...decalOffset.back, coords), "back", { height: 1, width })(
        mapData
      );
    });

    return mapData;
  };
};

module.exports = {
  getRadius,
  generateGrid,
  addRoom,
  isOccupied,
  renderGrid,
};
