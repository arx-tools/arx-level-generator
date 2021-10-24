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

// const distance3D = compose(magnitude, subtractVec3);
// https://github.com/arx/ArxLibertatis/blob/ArxFatalis-1.21/Sources/Include/EERIEmath.h#L557
const distance3D = ([x0, y0, z0], [x1, y1, z1]) => {
  return Math.sqrt((x1 - x0) ** 2 + (y1 - y0) ** 2 + (z1 - z0) ** 2);
};

const area = (vertices) => {
  /*
  if (isQuad(vertices)) {
    const [a, b, c, d] = vertices;
    return area([a, b, c]) + area([c, b, d]);
  } else {
    const [a, b, c] = withoutZeroVertex(vertices);
    return magnitude(cross(subtractVec3(a, b), subtractVec3(a, c))) / 2;
  }
  */

  // https://github.com/arx/ArxLibertatis/blob/ArxFatalis-1.21/Sources/EERIE/EERIEPoly.cpp#L3134
  const a = distance3D(
    [
      (vertices[0][0] + vertices[1][0]) / 2,
      (vertices[0][1] + vertices[1][1]) / 2,
      (vertices[0][2] + vertices[1][2]) / 2,
    ],
    vertices[2]
  );
  const b = distance3D(vertices[0], vertices[1]);

  let area = (a * b) / 2;

  // https://github.com/arx/ArxLibertatis/blob/ArxFatalis-1.21/Sources/EERIE/EERIEDraw.cpp#L267
  /*
  if (isQuad(vertices)) {
    const c = distance3D(
      [
        (vertices[1][0] + vertices[2][0]) / 2,
        (vertices[1][1] + vertices[2][1]) / 2,
        (vertices[1][2] + vertices[2][2]) / 2,
      ],
      vertices[3]
    );

    const d = distance3D(vertices[3], vertices[1]);

    area += c * (d / 2);
  }
  */
  area += 0;

  return area;
};

const fromPolygonData = (polygon) => {
  return {
    ...polygon,
    vertices: polygon.vertices.map(({ posX, posY, posZ }) => [
      Math.round(posX * 10 ** 4) / 10 ** 4,
      Math.round(posY * 10 ** 4) / 10 ** 4,
      Math.round(posZ * 10 ** 4) / 10 ** 4,
    ]),
  };
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
  distance3D,
  area,
  fromPolygonData,
};
