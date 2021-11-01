// const { compose, times, identity, reduce, __, map } = require("ramda");
// const { plain, pillars } = require("./prefabs");
// const {
//   generateBlankMapData,
//   movePlayerTo,
//   finalize,
//   saveToDisk,
//   setColor,
//   move,
//   isPointInPolygon,
//   isBetweenInclusive,
//   toFloatRgb,
// } = require("./helpers.js");
// const { items, moveTo, createItem, addScript } = require("./assets/items.js");
// const { ambiences, useAmbience } = require("./assets/ambiences.js");
// const { color, declare } = require("./scripting.js");

// --------------------------------------

// const addZone =
//   (pos, name, ambience = ambiences.none) =>
//   (mapData) => {
//     let [x, y, z] = move(-origin[0], 100, -origin[2], pos);

//     useAmbience(ambience);

//     const zoneData = {
//       header: {
//         name,
//         idx: 0,
//         flags: 6,
//         initPos: { x, y, z },
//         pos: { x, y, z },
//         rgb: toFloatRgb(mapData.state.color),
//         farClip: 2800,
//         reverb: 0,
//         ambianceMaxVolume: 100,
//         height: -1,
//         ambiance: ambience.name,
//       },
//       pathways: [
//         { rpos: { x: -100, y: 0, z: 100 }, flag: 0, time: 0 },
//         { rpos: { x: -100, y: 0, z: -100 }, flag: 0, time: 2000 },
//         { rpos: { x: 100, y: 0, z: -100 }, flag: 0, time: 2000 },
//         { rpos: { x: 100, y: 0, z: 100 }, flag: 0, time: 0 },
//       ],
//     };

//     mapData.dlf.paths.push(zoneData);
//     return mapData;
//   };

// const addLight = (pos) => (mapData) => {
//   let [x, y, z] = move(-origin[0], 0, -origin[2], pos);
//   mapData.llf.lights.push({
//     pos: { x, y, z },
//     rgb: toFloatRgb(mapData.state.color),
//     fallstart: 50,
//     fallend: 180,
//     intensity: 0.7,
//     i: 0,
//     exFlicker: {
//       r: 0,
//       g: 0,
//       b: 0,
//     },
//     exRadius: 0,
//     exFrequency: 0.01,
//     exSize: 0.1,
//     exSpeed: 0,
//     exFlareSize: 0,
//     extras: 0,
//   });

//   return mapData;
// };

// -------------------------------------------------

/*
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
declare("int", "hadIntro", welcomeMarker);
addScript(
  `
ON INIT {
  SETCONTROLLEDZONE welcome
  SET ${welcomeMarker.state.hadIntro} 0
  CINEMASCOPE ON
  WORLDFADE OUT 0 ${color(colors.ambience)}
  ACCEPT
}

ON CONTROLLEDZONE_ENTER {
  if (${welcomeMarker.state.hadIntro} == 0) {
    SET ${welcomeMarker.state.hadIntro} 1
    SETPLAYERCONTROLS OFF
    TIMERfade 1 2 worldfade IN 2000
    SPEAK -a [alia_nightmare2] GOTO READY
    ACCEPT
  }

  ACCEPT
}

>>READY
  CINEMASCOPE -s OFF
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
*/

// -------------------------------------------------

//   // plain(move(0, 0, (12 * 100) / 2 + (50 * 100) / 2 - 100, origin), [3, 50]),
//   // setColor(colors.terrain),
//   // pillars(
//   //   move(0, 0, (12 * 100) / 2 + (50 * 100) / 2, origin),
//   //   20,
//   //   [1000, 3000],
//   //   [300, 5000],
//   //   [400, 0, 400, 0]
//   // ),
//   // setColor(colors.pillars),

//   // -------------

//   // addZone(origin, "welcome", ambiences.sirs),
//   // setColor(colors.ambience),

//   // addItem(move(0, -300, 0, origin), [0, 0, 0], welcomeMarker),

//   // addItem(origin, [0, 0, 0], smellyFlower),
//   // addItem(move(-70, -20, +90, origin), [0, 0, 0], createItem(items.torch)),

//   // -------------

// -------------------------------------------------
// -------------------------------------------------

const aliasNightmare = require("./projects/alias-nightmare/index.js");

(async () => {
  await aliasNightmare({
    origin: [6000, 0, 6000],
    levelIdx: 1,
  });
  console.log("done");
})();
