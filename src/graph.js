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

// --------------------

// 1st polygon of level8/fast.fts
// vertices are laid down in a russian i shape (И):
// 02
// 13
const vertices = [
  [5190.00048828125, 335.0000915527344, 10550.005859375],
  [5200.00048828125, 340.0000915527344, 10560.005859375],
  [5190.00048828125, 335.0000915527344, 10650.005859375],
  [5200.00048828125, 340.0000915527344, 10650.005859375],
];

// area(vertices); // expected: 4503.2490234375, result: 1062.1322893124002

// quad with clockwise winding
const clockwise = [
  subtractVec3(vertices[0], vertices[2]),
  subtractVec3(vertices[2], vertices[3]),
  subtractVec3(vertices[3], vertices[1]),
  subtractVec3(vertices[1], vertices[0]),
];
/*
=
[
  [0, 0, 100],
  [10, 5, 0],
  [0, 0, -90],
  [-10, -5, -10]
]
*/

// ---------------------

// quad with counter-clockwise winding
const counterClockwise = [
  subtractVec3(vertices[0], vertices[1]),
  subtractVec3(vertices[1], vertices[3]),
  subtractVec3(vertices[3], vertices[2]),
  subtractVec3(vertices[2], vertices[0]),
];
/*
=
[
  [10, 5, 10],
  [0, 0, 90],
  [-10, -5, 0],
  [0, 0, -100]
]
*/
