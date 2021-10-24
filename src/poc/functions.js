const {
  compose,
  map,
  apply,
  flip,
  subtract,
  zip,
  aperture,
  converge,
  append,
  head,
  identity,
  all,
  equals,
  both,
  length,
  none,
  reject,
  repeat,
  divide,
} = require("ramda");

const subtractVec3 = compose(map(apply(flip(subtract))), zip);

const pairVec3s = compose(aperture(2), converge(append, [head, identity]));

const toVectors = compose(map(apply(subtractVec3)), pairVec3s);

const isZeroVertex = all(equals(0));

const isQuad = both(compose(equals(4), length), none(isZeroVertex));

const withoutZeroVertex = reject(isZeroVertex);

const cross = (u, v) => {
  return [
    u[1] * v[2] - u[2] * v[1],
    u[2] * v[0] - u[0] * v[2],
    u[0] * v[1] - u[1] * v[0],
  ];
};

const magnitude = ([x, y, z]) => {
  return Math.sqrt(x ** 2 + y ** 2 + z ** 2);
};

const normalize = (v) => {
  return map(apply(divide), zip(v, repeat(magnitude(v), 3)));
};

const area = (vertices) => {
  if (isQuad(vertices)) {
    const [a, b, c, d] = vertices;
    return area([a, b, c]) + area([c, b, d]);
  } else {
    const [a, b, c] = withoutZeroVertex(vertices);
    return magnitude(cross(subtractVec3(a, b), subtractVec3(a, c))) / 2;
  }
};

module.exports = {
  subtractVec3,
  pairVec3s,
  toVectors,
  isZeroVertex,
  isQuad,
  withoutZeroVertex,
  cross,
  magnitude,
  normalize,
  area,
};
