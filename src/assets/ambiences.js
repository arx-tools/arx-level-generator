const { compose, clone, filter, propEq, reduce, uniq } = require("ramda");

const ambiences = {
  none: {
    name: "NONE",
    native: true,
  },
  noden: {
    name: "ambient_noden",
    native: true,
  },
  sirs: {
    name: "ambient_sirs",
    tracks: ["sfx/ambiance/loop_sirs.wav"],
    native: false,
  },
};

const usedAmbiences = [];
const useAmbience = (ambience) => {
  usedAmbiences.push(ambience);
};

const exportAmbiences = (outputDir) => {
  return compose(
    reduce((files, ambience) => {
      const filename = `${outputDir}sfx/ambiance/${ambience.name}.amb`;

      files[filename] = `./assets/sfx/ambiance/${ambience.name}.amb`;

      const tracks = ambience.tracks || [];
      tracks.forEach((track) => {
        files[`${outputDir}${track}`] = `./assets/${track}`;
      });

      return files;
    }, {}),
    uniq,
    filter(propEq("native", false)),
    clone
  )(usedAmbiences);
};

module.exports = { ambiences, useAmbience, exportAmbiences };
