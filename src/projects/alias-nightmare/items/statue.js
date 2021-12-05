const { compose } = require("ramda");
const {
  addScript,
  createItem,
  items,
  markAsUsed,
  moveTo,
} = require("../../../assets/items");
const { getInjections } = require("../../../scripting");

module.exports.createStatue = (pos, angle = [0, 0, 0], props = {}) => {
  return compose(
    markAsUsed,
    moveTo(pos, angle),
    addScript((self) => {
      return `
// component: statue
ON INIT {
  ${getInjections("init", self)}
  ACCEPT
}
      `;
    }),
    createItem
  )(items.npc.statue, {
    name: "Tulpa",
    speed: 3,
    hp: 1000,
    ...props,
  });
};
