const { compose, times, identity, reduce, __, map } = require("ramda");
const { room, pillar } = require("./prefabs");
const {
  generateBlankMapData,
  movePlayerTo,
  finalize,
  saveToDisk,
  setLightColor,
  move,
  isPointInPolygon,
} = require("./helpers.js");
const { items, moveTo, createItem, addScript } = require("./assets/items.js");
const { ambiences, useAmbience } = require("./assets/ambiences.js");
const { color, declare } = require("./scripting.js");

const origin = [5000, 0, 5000];

const pillars = (
  originalX,
  originalY,
  originalZ,
  n,
  excludeRadius = 100,
  excludeBand = 100
) =>
  reduce(
    (mapData) => {
      // TODO: generate them more evenly spaced out
      // TODO: implement excludeBand -> ╬ leave out excludeBand area on both axis

      do {
        x = originalX + Math.random() * origin[0] - origin[0] / 2;
        z = originalZ + Math.random() * origin[2] - origin[2] / 2;
      } while (
        x >= originalX - excludeRadius &&
        x <= originalX + excludeRadius &&
        z >= originalZ - excludeRadius &&
        z <= originalZ + excludeRadius
      );

      return pillar(x, originalY, z, 20)(mapData);
    },
    __,
    times(identity, n)
  );

const addZone =
  (pos, name, ambience = ambiences.none) =>
  (mapData) => {
    let [x, y, z] = move(-origin[0], 100, -origin[2], pos);

    useAmbience(ambience);

    const zoneData = {
      header: {
        name,
        idx: 0,
        flags: 6,
        initPos: { x, y, z },
        pos: { x, y, z },
        rgb: mapData.state.lightColor,
        farClip: 2800,
        reverb: 0,
        ambianceMaxVolume: 100,
        height: -1,
        ambiance: ambience.name,
      },
      pathways: [
        {
          rpos: {
            x: -100,
            y: 0,
            z: 100,
          },
          flag: 0,
          time: 0,
        },
        {
          rpos: {
            x: -100,
            y: 0,
            z: -100,
          },
          flag: 0,
          time: 2000,
        },
        {
          rpos: {
            x: 100,
            y: 0,
            z: -100,
          },
          flag: 0,
          time: 2000,
        },
        {
          rpos: {
            x: 100,
            y: 0,
            z: 100,
          },
          flag: 0,
          time: 0,
        },
      ],
    };

    mapData.dlf.paths.push(zoneData);
    return mapData;
  };

const addItem = (pos, angle, itemRef) => (mapData) => {
  moveTo(move(-origin[0], origin[1] + 150, -origin[2], pos), angle, itemRef);
  return mapData;
};

// -------------------------------------------------

const portcullis = compose(
  declare("int", "ok1"),
  declare("int", "ok2"),
  declare("int", "open"),
  createItem
)(items.doors.portcullis);

addScript(
  `
ON INIT {
  SET ${portcullis.state.ok1} 0
  SET ${portcullis.state.ok2} 0
  ACCEPT
}

ON LOAD {
  USE_MESH "L2_Gobel_portcullis\\L2_Gobel_portcullis.teo"
  ACCEPT
}

ON GAME_READY {
  ANCHOR_BLOCK ON
  ACCEPT
}

ON CLOSE {
  IF (${portcullis.state.open} == 0) {
    ACCEPT
  }
  SET ${portcullis.state.open} 0
  PLAYANIM -e ACTION2 COLLISION ON
  VIEWBLOCK ON
  PLAY ~£closesfx~
  REFUSE
}

ON OPEN {
  IF (${portcullis.state.open} == 1) {
    ACCEPT
  }
  SET ${portcullis.state.open} 1
  PLAYANIM -e ACTION1 COLLISION OFF
  PLAY ~£opensfx~
  VIEWBLOCK OFF
  ANCHOR_BLOCK OFF
  REFUSE
}

ON CUSTOM {
  IF (^$PARAM1 == "PAD1_UP" ) {
   SET ${portcullis.state.ok1} 0
   GOTO CHECK
   ACCEPT
  }
  IF (^$PARAM1 == "PAD1_DOWN" ) {
   SET ${portcullis.state.ok1} 1
   GOTO CHECK
   ACCEPT
  }
  IF (^$PARAM1 == "PAD2_UP" ) {
   SET ${portcullis.state.ok2} 0
   GOTO CHECK
   ACCEPT
  }
  IF (^$PARAM1 == "PAD2_DOWN" ) {
   SET ${portcullis.state.ok2} 1
   GOTO CHECK
   ACCEPT
  }
 ACCEPT
}

>>CHECK
  IF (${portcullis.state.ok1} == 1) {
    IF (${portcullis.state.ok2} == 1) {
      SENDEVENT OPEN SELF ""
      ACCEPT
    }
    SENDEVENT CLOSE SELF ""
    ACCEPT
  }

  SENDEVENT CLOSE SELF ""
  ACCEPT
`,
  portcullis
);

const pressurePlate1 = compose(
  declare("int", "onme"),
  createItem
)(items.mechanisms.pressurePlate);

addScript(
  `
ON INIT {
  SETSCALE 101
  ACCEPT
}

ON INITEND {
  TIMERontop -im 0 500 GOTO TOP
  ACCEPT
}

>>TOP
  IF ( ^$OBJONTOP == "NONE" ) {
    IF ( ${pressurePlate1.state.onme} == 1 ) {
      SET ${pressurePlate1.state.onme} 0
      PLAYANIM ACTION2
      SENDEVENT CUSTOM ${portcullis.ref} "PAD1_UP"
    }
    ACCEPT
  }
  IF ( ${pressurePlate1.state.onme} == 0 ) {
    SET ${pressurePlate1.state.onme} 1
    PLAYANIM ACTION1
    SENDEVENT CUSTOM ${portcullis.ref} "PAD1_DOWN"
  }
  ACCEPT
`,
  pressurePlate1
);

const pressurePlate2 = compose(
  declare("int", "onme"),
  createItem
)(items.mechanisms.pressurePlate);

addScript(
  `
ON INIT {
  SETSCALE 101
  ACCEPT
}

ON INITEND {
  TIMERontop -im 0 500 GOTO TOP
  ACCEPT
}

>>TOP
  IF ( ^$OBJONTOP == "NONE" ) {
    IF ( ${pressurePlate2.state.onme} == 1 ) {
      SET ${pressurePlate2.state.onme} 0
      PLAYANIM ACTION2
      SENDEVENT CUSTOM ${portcullis.ref} "PAD2_UP"
    }
    ACCEPT
  }
  IF ( ${pressurePlate2.state.onme} == 0 ) {
    SET ${pressurePlate2.state.onme} 1
    PLAYANIM ACTION1
    SENDEVENT CUSTOM ${portcullis.ref} "PAD2_DOWN"
  }
  ACCEPT
`,
  pressurePlate2
);

const welcomeMarker = createItem(items.marker);
addScript(
  `
ON INIT {
  SETCONTROLLEDZONE welcome
  cinemascope on
  worldfade OUT 0 ${color("white")}
  SETPLAYERCONTROLS OFF
  ACCEPT
}

ON CONTROLLEDZONE_ENTER {
  UNSET_CONTROLLED_ZONE welcome
  TIMERfade 1 2 worldfade IN 2000
  SPEAK -a [alia_nightmare2] GOTO READY
  ACCEPT
}

>>READY
  cinemascope off
  SETPLAYERCONTROLS ON
  ACCEPT
`,
  welcomeMarker
);

const smellyFlower = createItem(items.plants.fern);
addScript(
  `
ON INIT {
  SETNAME "Smelly Flower"
  ACCEPT
}
`,
  smellyFlower
);

// -------------------------------------------------

const generate = compose(
  saveToDisk,
  finalize,

  room(...move(0, 0, (12 * 100) / 2 + (50 * 100) / 2 - 100, origin), [3, 50]),
  pillars(...move(0, 0, (12 * 100) / 2 + (50 * 100) / 2, origin), 10, 3 * 100),

  addItem(move(0, 0, (12 * 100) / 2, origin), [0, 90, 0], portcullis),
  addItem(
    move(-(12 * 100) / 4, -16, (12 * 100) / 4, origin),
    [0, 0, 0],
    pressurePlate1
  ),
  addItem(
    move((12 * 100) / 4, -16, (12 * 100) / 4, origin),
    [0, 0, 0],
    pressurePlate2
  ),
  addItem(move(0, -300, 0, origin), [0, 0, 0], welcomeMarker),
  addZone(origin, "welcome", ambiences.sirs),
  addItem(origin, [0, 0, 0], smellyFlower),
  addItem(move(-70, -20, +90, origin), [0, 0, 0], createItem(items.torch)),
  room(...origin, 12, (polygons) => {
    const spawn = origin;
    const pressurePlate1 = move(-(12 * 100) / 4, 0, (12 * 100) / 4, origin);
    const pressurePlate2 = move((12 * 100) / 4, 0, (12 * 100) / 4, origin);

    return compose(
      map((polygon) => {
        if (isPointInPolygon(spawn, polygon)) {
          polygon.bumpable = false;
        }

        if (
          isPointInPolygon(pressurePlate1, polygon) ||
          isPointInPolygon(pressurePlate2, polygon)
        ) {
          polygon.tex = 0;
          polygon.bumpable = false;
        }

        return polygon;
      })
    )(polygons);
  }),

  pillars(...origin, 30, 12 * 100),
  setLightColor("#575757"),

  movePlayerTo(origin),
  generateBlankMapData
);

(async () => {
  await generate({
    levelIdx: 1,
  });

  console.log("done");
})();
