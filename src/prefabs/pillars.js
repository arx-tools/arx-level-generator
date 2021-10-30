const { reduce, times, identity, __ } = require("ramda");
const { isBetweenInclusive, randomBetween, move } = require("../helpers.js");
const pillar = require("./pillar.js");

const isInExcludeRadius = (pos, excludeRadius, x, z) => {
  const [originalX, originalY, originalZ] = pos;
  let excludeRadiusX = excludeRadius;
  let excludeRadiusZ = excludeRadius;
  if (Array.isArray(excludeRadius)) {
    [excludeRadiusX, excludeRadiusZ] = excludeRadius;
  }

  return (
    isBetweenInclusive(
      originalX - excludeRadiusX / 2,
      originalX + excludeRadiusX / 2,
      x
    ) &&
    isBetweenInclusive(
      originalZ - excludeRadiusZ / 2,
      originalZ + excludeRadiusZ / 2,
      z
    )
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

const pillars = (
  pos,
  n,
  radius,
  excludeRadius = 100,
  borderGap = [0, 0, 0, 0]
) =>
  reduce(
    (mapData) => {
      const { origin } = mapData.config;
      const [originalX, originalY, originalZ] = move(...origin, pos);
      let radiusX = radius;
      let radiusZ = radius;
      if (Array.isArray(radius)) {
        [radiusX, radiusZ] = radius;
      }

      do {
        x = originalX + randomBetween(-radiusX / 2, radiusX / 2);
        z = originalZ + randomBetween(-radiusZ / 2, radiusZ / 2);
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
