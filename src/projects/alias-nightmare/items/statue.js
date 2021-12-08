const { compose } = require("ramda");
const {
  addScript,
  createItem,
  items,
  markAsUsed,
  moveTo,
  createRootItem,
} = require("../../../assets/items");
const { getInjections } = require("../../../scripting");

module.exports.defineStatue = () => {
  return compose(
    addScript((self) => {
      return `
// component: statue
ON INIT {
  ${getInjections("init", self)}
  SET_MATERIAL STONE
  SETDETECT 2000

  PHYSICAL RADIUS 30

  SET_NPC_STAT RESISTMAGIC 100
  SET_NPC_STAT RESISTPOISON 100
  SET_NPC_STAT RESISTFIRE 100

  LOADANIM ACTION1 "statue_wait_4"
  LOADANIM WAIT "statue_wait"
  LOADANIM WALK "snake_woman_normal_walk"
  LOADANIM RUN "snake_woman_normal_run"

  BEHAVIOR NONE
  SETTARGET PLAYER

  TWEAK SKIN "FIXINTER_STATUE01" "DEMON_STATUE"

  PLAYANIM WAIT

  // TIMERmisc_reflection -i 0 7 SENDEVENT IDLE SELF ""

  SENDEVENT IDLE SELF ""
  SET_EVENT HEAR ON

  ACCEPT
}
      `;
    }),
    createRootItem
  )(items.npc.statue, {
    name: "Tulpa",
    speed: 3,
    hp: 1000,
  });
};

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
  )(items.npc.statue, props);
};
