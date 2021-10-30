const { reduce, times, identity, __ } = require("ramda");
const { isBetweenInclusive, randomBetween, move } = require("../helpers.js");
const pillar = require("./pillar.js");

// --------------------

const isInExcludeRadius = (pos, excludeRadius, x, z) => {
  const [originalX, originalY, originalZ] = pos;
  return (
    isBetweenInclusive(
      originalX - excludeRadius,
      originalX + excludeRadius,
      x
    ) &&
    isBetweenInclusive(originalZ - excludeRadius, originalZ + excludeRadius, z)
  );
};

const isInBorderGap = (pos, borderGap, x, z) => {
  const [originalX, originalY, originalZ] = pos;
  const [top, right, bottom, left] = borderGap; // clockwise order, like in CSS

  if (
    top > 0 &&
    z > 0 &&
    isBetweenInclusive(originalX - top, originalX + top, x)
  ) {
    return true;
  }

  if (
    bottom > 0 &&
    z < 0 &&
    isBetweenInclusive(originalX - bottom, originalX + bottom, x)
  ) {
    return true;
  }

  if (
    left > 0 &&
    x < 0 &&
    isBetweenInclusive(originalZ - left, originalZ + left, z)
  ) {
    return true;
  }

  if (
    right > 0 &&
    x > 0 &&
    isBetweenInclusive(originalZ - right, originalZ + right, z)
  ) {
    return true;
  }

  return false;
};

const tooCloseToOtherPillars = (x, z) => {
  // TODO: generate them more evenly spaced out
  return false;
};

// --------------------

const pillars = (pos, n, excludeRadius = 100, borderGap = [0, 0, 0, 0]) =>
  reduce(
    (mapData) => {
      const { origin } = mapData.config;
      const [originalX, originalY, originalZ] = move(...origin, pos);

      do {
        x = originalX + randomBetween(-origin[0] / 2, origin[0] / 2);
        z = originalZ + randomBetween(-origin[2] / 2, origin[2] / 2);
      } while (
        isInExcludeRadius(pos, excludeRadius, x, z) ||
        isInBorderGap(pos, borderGap, x, z) ||
        tooCloseToOtherPillars(x, z)
      );

      return pillar(x, originalY, z, 20)(mapData);
    },
    __,
    times(identity, n)
  );

module.exports = pillars;
