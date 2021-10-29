const { compose, times, identity, reduce, __, trim } = require("ramda");
const { room, pillar } = require("./prefabs");
const {
  generateBlankMapData,
  movePlayerTo,
  finalize,
  saveToDisk,
  setLightColor,
  move,
} = require("./helpers.js");
const { items, useItems } = require("./assets/items.js");
const { ambiences, useAmbience } = require("./assets/ambiences.js");

const pillars = (originalX, originalY, originalZ, n, excludeRadius = 100) =>
  reduce(
    (mapData) => {
      // TODO: generate them more evenly spaced out

      do {
        x = originalX + Math.random() * 5000 - 2500;
        z = originalZ + Math.random() * 5000 - 2500;
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
  (x, y, z, name, ambience = ambiences.none) =>
  (mapData) => {
    x -= 5000;
    z -= 5000;

    useAmbience(ambience);

    const zoneData = {
      header: {
        name,
        idx: 0,
        flags: 6,
        initPos: {
          x: x,
          y: y + 100,
          z: z,
        },
        pos: {
          x: x,
          y: y + 100,
          z: z,
        },
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

const addItem =
  (pos, angle, item, script = "") =>
  (mapData) => {
    useItems(move(-5000, 150, -5000, pos), angle, item, trim(script));
    return mapData;
  };

const origin = [5000, 0, 5000];

const generate = compose(
  saveToDisk,
  finalize,

  room(
    ...move(0, 0, (12 * 100) / 2 + (50 * 100) / 2 - 100, origin),
    [3, 50],
    "ns"
  ),
  pillars(...move(0, 0, (12 * 100) / 2 + (50 * 100) / 2, origin), 10, 3 * 100),

  addItem(
    move(0, 0, (12 * 100) / 2, origin),
    [0, 90, 0],
    items.doors.portcullis,
    `
ON INIT {
  SET §OK1 0
  SET §OK2 0
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
  IF (§open == 0) ACCEPT
  SET §open 0
  PLAYANIM -e ACTION2 COLLISION ON
  VIEWBLOCK ON
  PLAY ~£closesfx~
  REFUSE
}

ON OPEN {
  IF (§open == 1) ACCEPT
  SET §open 1
  PLAYANIM -e ACTION1 COLLISION OFF
  PLAY ~£opensfx~
  VIEWBLOCK OFF
  ANCHOR_BLOCK OFF
  REFUSE
}

ON CUSTOM {
  IF (^$PARAM1 == "PAD1_UP" ) {
   SET §OK1 0
   GOTO CHECK
   ACCEPT
  }
  IF (^$PARAM1 == "PAD1_DOWN" ) {
   SET §OK1 1
   GOTO CHECK
   ACCEPT
  }
  IF (^$PARAM1 == "PAD2_UP" ) {
   SET §OK2 0
   GOTO CHECK
   ACCEPT
  }
  IF (^$PARAM1 == "PAD2_DOWN" ) {
   SET §OK2 1
   GOTO CHECK
   ACCEPT
  }
 ACCEPT
}

>>CHECK
  IF (§OK1 == 1) {
    IF (§OK2 == 1) {
      SENDEVENT OPEN SELF ""
      ACCEPT
    }
    SENDEVENT CLOSE SELF ""
    ACCEPT
  }

  SENDEVENT CLOSE SELF ""
  ACCEPT
`
  ),
  addItem(
    move(-(12 * 100) / 4, -25, (12 * 100) / 4, origin),
    [0, 0, 0],
    items.mechanisms.pressurePlate,
    `
ON INITEND {
  TIMERontop -im 0 500 GOTO TOP
  ACCEPT
}

>>TOP
  IF ( ^$OBJONTOP == "NONE" ) {
    IF ( §onme == 1 ) {
      SET §onme 0
      PLAYANIM ACTION2
      SENDEVENT CUSTOM porticullis_0001 "PAD1_UP"
    }
    ACCEPT
  }
  IF ( §onme == 0 ) {
    SET §onme 1
    PLAYANIM ACTION1
    SENDEVENT CUSTOM porticullis_0001 "PAD1_DOWN"
  }
  ACCEPT
`
  ),
  addItem(
    move((12 * 100) / 4, -25, (12 * 100) / 4, origin),
    [0, 0, 0],
    items.mechanisms.pressurePlate,
    `
ON INITEND {
  TIMERontop -im 0 500 GOTO TOP
  ACCEPT
}

>>TOP
  IF ( ^$OBJONTOP == "NONE" ) {
    IF ( §onme == 1 ) {
      SET §onme 0
      PLAYANIM ACTION2
      SENDEVENT CUSTOM porticullis_0001 "PAD2_UP"
    }
    ACCEPT
  }
  IF ( §onme == 0 ) {
    SET §onme 1
    PLAYANIM ACTION1
    SENDEVENT CUSTOM porticullis_0001 "PAD2_DOWN"
  }
  ACCEPT
`
  ),

  addItem(
    move(0, -300, 0, origin),
    [0, 0, 0],
    items.marker,
    `
ON INIT {
  SETCONTROLLEDZONE welcome
  worldfade OUT 0 255 255 255
  SETPLAYERCONTROLS OFF
  ACCEPT
}

ON CONTROLLEDZONE_ENTER {
  TIMERfade 1 2 worldfade IN 2000
  SPEAK -a [alia_nightmare2] GOTO READY
  UNSET_CONTROLLED_ZONE welcome
  ACCEPT
}

>>READY
  SETPLAYERCONTROLS ON
  ACCEPT
`
  ),
  addZone(...origin, "welcome", ambiences.sirs),
  addItem(
    origin,
    [0, 0, 0],
    items.plants.fern,
    `
ON INIT {
  SETNAME "Smelly Flower"
  ACCEPT
}
  `
  ),
  addItem(move(-70, -20, +90, origin), [0, 0, 0], items.torch),
  room(...origin, 12, "n"),

  pillars(...origin, 30, 12 * 100),
  setLightColor("#575757"),

  movePlayerTo(...origin),
  generateBlankMapData
);

(async () => {
  await generate({
    levelIdx: 1,
  });

  console.log("done");
})();
