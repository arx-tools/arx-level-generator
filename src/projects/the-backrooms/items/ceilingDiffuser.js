const { compose } = require("ramda");
const {
  createItem,
  addScript,
  createRootItem,
  moveTo,
  markAsUsed,
} = require("../../../assets/items");
const { useTexture, textures } = require("../../../assets/textures");
const { getInjections } = require("../../../scripting");

const itemDesc = {
  src: "fix_inter/ceiling_diffuser/ceiling_diffuser.teo",
  native: true,
};

module.exports.defineCeilingDiffuser = () => {
  useTexture(textures.backrooms.ceilingDiffuser);

  return compose(
    addScript((self) => {
      return `
// component: ceilingDiffuser
ON INIT {
  ${getInjections("init", self)}
  USEMESH "polytrans/polytrans.teo"
  ACCEPT
}

ON INITEND {
  TWEAK SKIN "[stone]_ground_caves_wet05" "backrooms-[metal]-ceiling-air-diffuser"
  ACCEPT
}
      `;
    }),
    createRootItem
  )(itemDesc, {
    name: "Ceiling Diffuser",
    interactive: false,
    scale: 0.6,
  });
};

module.exports.createCeilingDiffuser = (
  pos,
  angle = [0, 0, 0],
  config = {}
) => {
  return compose(
    markAsUsed,
    moveTo(pos, angle),
    addScript((self) => {
      return `
// component: ceilingDiffuser
ON INIT {
  ${getInjections("init", self)}
  ACCEPT
}
      `;
    }),
    createItem
  )(itemDesc, {});
};
