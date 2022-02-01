const { compose, clone, filter, propEq, reduce, uniq } = require("ramda");
const { getAssetsFolder } = require("../constants");

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

let usedAmbiences = [];

const useAmbience = (ambience) => {
  usedAmbiences.push(ambience);
};

const exportAmbiences = (outputDir) => {
  return compose(
    reduce((files, ambience) => {
      const filename = `${outputDir}/sfx/ambiance/${ambience.name}.amb`;

      files[filename] = `${getAssetsFolder()}/sfx/ambiance/${
        ambience.name
      }.amb`;

      const tracks = ambience.tracks || [];
      tracks.forEach((track) => {
        files[`${outputDir}/${track}`] = `${getAssetsFolder()}/${track}`;
      });

      return files;
    }, {}),
    uniq,
    filter(propEq("native", false)),
    clone
  )(usedAmbiences);
};

const resetAmbiences = () => {
  usedAmbiences = [];
};

module.exports = { ambiences, useAmbience, exportAmbiences, resetAmbiences };
