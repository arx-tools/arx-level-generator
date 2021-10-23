const subtractVectors = compose(map(apply(flip(subtract))), zip);

const pairArrays = compose(aperture(2), converge(append, [head, identity]));

const toVectors = compose(map(apply(subtractVectors)), pairArrays);

const isZeroVertex = all(equals(0));

const isQuad = complement(has(isZeroVertex));

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
  return "?";
};

// --------------------

const vertices = [
  [5350.00048828125, 335.0000915527344, 10550.005859375],
  [5260.00048828125, 335.0000915527344, 10550.005859375],
  [5260.00048828125, 270.0000915527344, 10550.005859375],
  [0, 0, 0],
];

area(vertices);

/*
;[
  normalize(cross(
    subtractVectors(vertices[1], vertices[0]),
    subtractVectors(vertices[2], vertices[0])
  )),
]
*/

// ------------------

/*

expected results:

normals: [
  {
    "x": 0,
    "y": -0.37828773260116577,
    "z": 0.7352360486984253
  },
  {
    "x": 0,
    "y": -0.44193923473358154,
    "z": 0.7101149559020996
  },
  {
    "x": 0,
    "y": 0,
    "z": 0.9762266874313354
  },
  {
    "x": 0,
    "y": 0,
    "z": 0
  }
]


"norm": {
  "x": 0,
  "y": 0,
  "z": 0.9458710551261902
},

"norm2": {
  "x": 0,
  "y": 0,
  "z": 0
}

"area": 3850.702392578125,
*/
