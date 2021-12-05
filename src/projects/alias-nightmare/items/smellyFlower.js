const { compose } = require("ramda");
const {
  addScript,
  createItem,
  items,
  markAsUsed,
  moveTo,
} = require("../../../assets/items");
const { getInjections } = require("../../../scripting");

module.exports.createSmellyFlower = (pos, angle = [0, 0, 0], props = {}) => {
  return compose(
    markAsUsed,
    moveTo(pos, angle),
    addScript((self) => {
      return `
// component: smellyFlower
ON INIT {
  ${getInjections("init", self)}
  ACCEPT
}
      `;
    }),
    createItem
  )(items.plants.fern, {
    name: "Smelly flower",
    ...props,
  });
};
