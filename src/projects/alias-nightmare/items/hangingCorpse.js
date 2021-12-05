const { compose } = require("ramda");
const {
  addScript,
  createItem,
  items,
  markAsUsed,
  moveTo,
} = require("../../../assets/items");
const { getInjections } = require("../../../scripting");

module.exports.createHangingCorpse = (pos, angle = [0, 0, 0], props = {}) => {
  return compose(
    markAsUsed,
    moveTo(pos, angle),
    addScript((self) => {
      return `
// component: hangingCorpse
ON INIT {
  ${getInjections("init", self)}
  INVENTORY CREATE
  INVENTORY SKIN "ingame_inventory_corpse"
  INVENTORY ADD "jewelry\\gold_coin\\gold_coin"
  ACCEPT
}

ON DIE {
  REFUSE
}
      `;
    }),
    createItem
  )(items.corpse.hanging, {
    hp: 0,
    ...props,
  });
};
