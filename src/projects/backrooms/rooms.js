const { times, repeat, clamp, curry, flatten, uniq, pathEq } = require("ramda");
const { pickRandoms } = require("../../helpers");

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

// ---------------------------

const generateGrid = curry((size) => {
  if (size % 2 === 0) {
    size++;
  }

  return times(() => {
    return repeat(0, size);
  }, size);
});

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

  const candidate = pickRandoms(1, candidates)[0];

  const variants = getFittingVariants(
    candidate[0],
    candidate[1],
    width,
    height,
    grid
  );

  const startingPos = pickRandoms(1, variants)[0];

  return insertRoom(startingPos[0], startingPos[1], width, height, grid);
});

module.exports = {
  getRadius,
  generateGrid,
  addRoom,
};
