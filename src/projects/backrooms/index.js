const { compose } = require("ramda");
const { generateBlankMapData, finalize, saveToDisk } = require("../../helpers");

const generate = async (config) => {
  return compose(
    saveToDisk,
    finalize,

    // TODO

    generateBlankMapData
  )(config);
};

module.exports = generate;
