const {
  area,
  subtractVec3,
  isQuad,
  fromPolygonData,
} = require("./functions.js");
const fs = require("fs");

const fts = require("./level8/fast.fts.json");

const output = [];

const polygons = fts.polygons
  .map(fromPolygonData)
  .filter(({ vertices }) => !isQuad(vertices));

for (let n = 0; n < 234; n++) {
  const vertices = polygons[n].vertices;

  let clockwise;
  if (isQuad(vertices)) {
    clockwise = [
      subtractVec3(vertices[0], vertices[2]),
      subtractVec3(vertices[2], vertices[3]),
      subtractVec3(vertices[3], vertices[1]),
      subtractVec3(vertices[1], vertices[0]),
    ];
    counterClockwise = [
      subtractVec3(vertices[0], vertices[1]),
      subtractVec3(vertices[1], vertices[3]),
      subtractVec3(vertices[3], vertices[2]),
      subtractVec3(vertices[2], vertices[0]),
    ];
  } else {
    clockwise = [
      subtractVec3(vertices[0], vertices[2]),
      subtractVec3(vertices[2], vertices[1]),
      subtractVec3(vertices[1], vertices[0]),
    ];
    counterClockwise = [
      subtractVec3(vertices[0], vertices[1]),
      subtractVec3(vertices[1], vertices[2]),
      subtractVec3(vertices[2], vertices[0]),
    ];
  }

  const result = {
    vertices,
    vectors: {
      clockwise,
      counterClockwise,
    },
    area: {
      expected: polygons[n].area,
      got: area(vertices),
    },
  };

  clockwise = result.vectors.clockwise
    .map((vector) => `        [ ${vector.join(", ")} ]`)
    .join(",\n");

  counterClockwise = result.vectors.counterClockwise
    .map((vector) => `        [ ${vector.join(", ")} ]`)
    .join(",\n");

  output.push(`  {
    "vertices": [
      [ ${result.vertices[0].join(", ")} ],
      [ ${result.vertices[1].join(", ")} ],
      [ ${result.vertices[2].join(", ")} ],
      [ ${result.vertices[3].join(", ")} ]
    ],
    "vectors": {
      "clockwise": [
${clockwise}
      ],
      "counterClockwise": [
${counterClockwise}
      ]
    },
    "area": {
      "expected": ${result.area.expected},
      "got": ${result.area.got},
      "percent": ${result.area.got / result.area.expected}
    }
  }`);
}

fs.writeFileSync(
  "e:/area-test-output.json",
  "[\n" + output.join(",\n") + "\n]"
);

/*
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
  subtractVec3(vertices[0], vertices[2]), // [0, 0, 100],
  subtractVec3(vertices[2], vertices[3]), // [10, 5, 0]
  subtractVec3(vertices[3], vertices[1]), // [0, 0, -90]
  subtractVec3(vertices[1], vertices[0]), // [-10, -5, -10]
];

// ---------------------

// quad with counter-clockwise winding
const counterClockwise = [
  subtractVec3(vertices[0], vertices[1]), // [10, 5, 10]
  subtractVec3(vertices[1], vertices[3]), // [0, 0, 90]
  subtractVec3(vertices[3], vertices[2]), // [-10, -5, 0]
  subtractVec3(vertices[2], vertices[0]), // [0, 0, -100]
];
*/
