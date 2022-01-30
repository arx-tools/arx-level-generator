const { compose } = require("ramda");
const {
  markAsUsed,
  addScript,
  createRootItem,
  items,
} = require("../../assets/items");
const { getInjections } = require("../../scripting");

const overridePlayerScript = () => {
  compose(
    markAsUsed,
    addScript((self) => {
      return `
// component: player
ON GAME_READY {
  IF (§fighting_amb == 0) {
    AMBIANCE -v 0 ambient_fight
  }
  ACCEPT
}

ON INIT {
  ${getInjections("init", self)}

  LOADANIM WAIT                       "player_wait_short"
  LOADANIM WAIT_SHORT                 "player_wait_1st"
  LOADANIM WALK                       "human_normal_walk"
  LOADANIM WALK_MINISTEP              "human_normal_walk_little_steps"
  LOADANIM STRAFE_RIGHT               "human_normal_strafe_right"
  LOADANIM STRAFE_LEFT                "human_normal_strafe_left"
  LOADANIM WALK_BACKWARD              "human_normal_walk_backward"
  LOADANIM RUN                        "player_normal_run_test"
  LOADANIM RUN_BACKWARD               "player_normal_run_backward_test"
  LOADANIM STRAFE_RUN_RIGHT           "player_normal_strafe_run_right"
  LOADANIM STRAFE_RUN_LEFT            "player_normal_strafe_run_left"
  LOADANIM U_TURN_LEFT                "player_uturn_left"
  LOADANIM U_TURN_RIGHT               "player_uturn_right"
  LOADANIM U_TURN_LEFT_FIGHT          "player_uturn_left_fight"
  LOADANIM U_TURN_RIGHT_FIGHT         "player_uturn_right_fight"
  LOADANIM FIGHT_WAIT                 "human_fight_wait_player"
  LOADANIM FIGHT_WALK_FORWARD         "player_fight_walk"
  LOADANIM FIGHT_WALK_BACKWARD        "player_fight_walk_backward"
  LOADANIM FIGHT_STRAFE_RIGHT         "player_fight_strafe_right"
  LOADANIM FIGHT_STRAFE_LEFT          "player_fight_strafe_left"
  LOADANIM BARE_READY                 "human_fight_ready_noweap"
  LOADANIM BARE_UNREADY               "human_fight_unready_noweap"
  LOADANIM BARE_WAIT                  "human_fight_wait_noweap"
  LOADANIM BARE_STRIKE_RIGHT_START    "human_fight_attack_noweap_right_start"
  LOADANIM BARE_STRIKE_RIGHT_CYCLE    "human_fight_attack_noweap_right_cycle"
  LOADANIM BARE_STRIKE_RIGHT          "human_fight_attack_noweap_right_strike"
  LOADANIM BARE_STRIKE_LEFT_START     "human_fight_attack_noweap_left_start"
  LOADANIM BARE_STRIKE_LEFT_CYCLE     "human_fight_attack_noweap_left_cycle"
  LOADANIM BARE_STRIKE_LEFT           "human_fight_attack_noweap_left_strike"
  LOADANIM BARE_STRIKE_BOTTOM_START   "human_fight_attack_noweap_top_start"
  LOADANIM BARE_STRIKE_BOTTOM_CYCLE   "human_fight_attack_noweap_top_cycle"
  LOADANIM BARE_STRIKE_BOTTOM         "human_fight_attack_noweap_top_strike"
  LOADANIM BARE_STRIKE_TOP_START      "human_fight_attack_noweap_bottom_start"
  LOADANIM BARE_STRIKE_TOP_CYCLE      "human_fight_attack_noweap_bottom_cycle"
  LOADANIM BARE_STRIKE_TOP            "human_fight_attack_noweap_bottom_strike"
  LOADANIM 1H_READY_PART_1            "human_fight_ready_1handed_start"
  LOADANIM 1H_READY_PART_2            "human_fight_ready_1handed_end"
  LOADANIM 1H_UNREADY_PART_1          "human_fight_unready_1handed_start"
  LOADANIM 1H_UNREADY_PART_2          "human_fight_unready_1handed_end"
  LOADANIM 1H_WAIT                    "human_fight_wait_1handed"
  LOADANIM 1H_STRIKE_RIGHT_START      "human_fight_attack_1handed_left_start"
  LOADANIM 1H_STRIKE_RIGHT_CYCLE      "human_fight_attack_1handed_left_cycle"
  LOADANIM 1H_STRIKE_RIGHT            "human_fight_attack_1handed_left_strike"
  LOADANIM 1H_STRIKE_LEFT_START       "human_fight_attack_1handed_right_start"
  LOADANIM 1H_STRIKE_LEFT_CYCLE       "human_fight_attack_1handed_right_cycle"
  LOADANIM 1H_STRIKE_LEFT             "human_fight_attack_1handed_right_strike"
  LOADANIM 1H_STRIKE_TOP_START        "human_fight_attack_1handed_top_start"
  LOADANIM 1H_STRIKE_TOP_CYCLE        "human_fight_attack_1handed_top_cycle"
  LOADANIM 1H_STRIKE_TOP              "human_fight_attack_1handed_top_strike"
  LOADANIM 1H_STRIKE_BOTTOM_START     "human_fight_attack_1handed_bottom_start"
  LOADANIM 1H_STRIKE_BOTTOM_CYCLE     "human_fight_attack_1handed_bottom_cycle"
  LOADANIM 1H_STRIKE_BOTTOM           "human_fight_attack_1handed_bottom_strike"
  LOADANIM 2H_READY_PART_1            "human_fight_ready_2handed_start"
  LOADANIM 2H_READY_PART_2            "human_fight_ready_2handed_end"
  LOADANIM 2H_UNREADY_PART_1          "human_fight_unready_2handed_start"
  LOADANIM 2H_UNREADY_PART_2          "human_fight_unready_2handed_end"
  LOADANIM 2H_WAIT                    "human_fight_wait_2handed"
  LOADANIM 2H_STRIKE_RIGHT_START      "human_fight_attack_2handed_right_start"
  LOADANIM 2H_STRIKE_RIGHT_CYCLE      "human_fight_attack_2handed_right_cycle"
  LOADANIM 2H_STRIKE_RIGHT            "human_fight_attack_2handed_right_strike"
  LOADANIM 2H_STRIKE_LEFT_START       "human_fight_attack_2handed_left_start"
  LOADANIM 2H_STRIKE_LEFT_CYCLE       "human_fight_attack_2handed_left_cycle"
  LOADANIM 2H_STRIKE_LEFT             "human_fight_attack_2handed_left_strike"
  LOADANIM 2H_STRIKE_TOP_START        "human_fight_attack_2handed_top_start"
  LOADANIM 2H_STRIKE_TOP_CYCLE        "human_fight_attack_2handed_top_cycle"
  LOADANIM 2H_STRIKE_TOP              "human_fight_attack_2handed_top_strike"
  LOADANIM 2H_STRIKE_BOTTOM_START     "human_fight_attack_2handed_bottom_start"
  LOADANIM 2H_STRIKE_BOTTOM_CYCLE     "human_fight_attack_2handed_bottom_cycle"
  LOADANIM 2H_STRIKE_BOTTOM           "human_fight_attack_2handed_bottom_strike"
  LOADANIM DAGGER_READY_PART_1        "human_fight_ready_dagger_start"
  LOADANIM DAGGER_READY_PART_2        "human_fight_ready_dagger_end"
  LOADANIM DAGGER_UNREADY_PART_1      "human_fight_unready_dagger_start"
  LOADANIM DAGGER_UNREADY_PART_2      "human_fight_unready_dagger_end"
  LOADANIM DAGGER_WAIT                "human_fight_attack_dagger_wait"
  LOADANIM DAGGER_STRIKE_RIGHT_START  "human_fight_attack_dagger_right_start"
  LOADANIM DAGGER_STRIKE_RIGHT_CYCLE  "human_fight_attack_dagger_right_cycle"
  LOADANIM DAGGER_STRIKE_RIGHT        "human_fight_attack_dagger_right_strike"
  LOADANIM DAGGER_STRIKE_LEFT_START   "human_fight_attack_dagger_left_start"
  LOADANIM DAGGER_STRIKE_LEFT_CYCLE   "human_fight_attack_dagger_left_cycle"
  LOADANIM DAGGER_STRIKE_LEFT         "human_fight_attack_dagger_left_strike"
  LOADANIM DAGGER_STRIKE_TOP_START    "human_fight_attack_dagger_top_start"
  LOADANIM DAGGER_STRIKE_TOP_CYCLE    "human_fight_attack_dagger_top_cycle"
  LOADANIM DAGGER_STRIKE_TOP          "human_fight_attack_dagger_top_strike"
  LOADANIM DAGGER_STRIKE_BOTTOM_START "human_fight_attack_dagger_bottom_start"
  LOADANIM DAGGER_STRIKE_BOTTOM_CYCLE "human_fight_attack_dagger_bottom_cycle"
  LOADANIM DAGGER_STRIKE_BOTTOM       "human_fight_attack_dagger_bottom_strike"
  LOADANIM MISSILE_READY_PART_1       "human_fight_ready_bow_start"
  LOADANIM MISSILE_READY_PART_2       "human_fight_ready_bow_end"
  LOADANIM MISSILE_UNREADY_PART_1     "human_fight_unready_bow_start"
  LOADANIM MISSILE_UNREADY_PART_2     "human_fight_unready_bow_end"
  LOADANIM MISSILE_WAIT               "human_fight_wait_bow"
  LOADANIM MISSILE_STRIKE_PART_1      "human_fight_attack_bow_start_part1"
  LOADANIM MISSILE_STRIKE_PART_2      "human_fight_attack_bow_start_part2"
  LOADANIM MISSILE_STRIKE_CYCLE       "human_fight_attack_bow_cycle"
  LOADANIM MISSILE_STRIKE             "human_fight_attack_bow_strike"
  LOADANIM SHIELD_START               "human_fight_shield_in"
  LOADANIM SHIELD_CYCLE               "human_fight_shield_cycle"
  LOADANIM SHIELD_HIT                 "human_fight_shield_hit"
  LOADANIM SHIELD_END                 "human_fight_shield_out"
  LOADANIM CAST_START                 "human_castspell_in"
  LOADANIM CAST_CYCLE                 "human_castspell_cycle"
  LOADANIM CAST                       "human_castspell_cast"
  LOADANIM CAST_END                   "human_castspell_out"
  LOADANIM MEDITATION                 "human_meditation"
  LOADANIM LEVITATE                   "human_levitation"
  LOADANIM CROUCH_START               "human_normal_crouch_in"
  LOADANIM CROUCH_WAIT                "human_normal_crouch_cycle"
  LOADANIM CROUCH_END                 "human_normal_crouch_out"
  LOADANIM CROUCH_STRAFE_RIGHT        "human_normal_crouch_strafe_right"
  LOADANIM CROUCH_STRAFE_LEFT         "human_normal_crouch_strafe_left"
  LOADANIM CROUCH_WALK                "human_normal_crouch_walk_forward"
  LOADANIM CROUCH_WALK_BACKWARD       "human_normal_crouch_walk_backward"
  LOADANIM LEAN_LEFT                  "human_normal_lean_right_in"
  LOADANIM LEAN_RIGHT                 "human_normal_lean_left_in"
  LOADANIM JUMP_ANTICIPATION          "human_normal_jump_part1_anticipation"
  LOADANIM JUMP_UP                    "human_normal_jump_part2_jumpup"
  LOADANIM JUMP_CYCLE                 "human_normal_jump_part3_cycleinair"
  LOADANIM JUMP_END                   "human_normal_jump_part4_landing"
  LOADANIM JUMP_END_PART2             "human_normal_jump_part5_contact_floor"
  LOADANIM HOLD_TORCH                 "human_hold_torch_toponly"
  LOADANIM DIE                        "human_death5"
  LOADANIM HIT                        "human_fight_receive_damage"
  LOADANIM TALK_NEUTRAL               "human_talk_neutral_headonly"
  LOADANIM TALK_ANGRY                 "human_talk_angry_headonly"

  SET §fighting_amb 0
  SET §fightnow 0
  SET §vol 0

  SET #SHUT_UP 0
  SET #guitar_player_dead 0  // Used to check if guitar player is dead.
  SET #GOB_JAIL_DEAD 0    // Used to check if first goblin in jail has fallen in the hole.
  SET #gingle_played 0    // Used to know if Gingle Ylside have been played.
  SET #ISERBIUS_DEAD 0    // Used to destroy Iserbius after entounter in the secret temple.
  SET #SNAKE_DEAD 0    // Used to destroy snake woman in the city after teleportation cinematic.
  SET #SECRET_PASSAGE_TEMPLE 0  // Used to check if teleport is available to temple
  SET #TALKED_2ORTIERN 0    // Used to check if player has talked to Ortiern
  SET #KRAHOZ_ZOHARK_ON 0  // Used to know if player can touch statue
  SET #ASSASSIN_KILLED 0   // 1 if ratman assassin killed 
  SET #DRUNK 0       // wine management
  SET #king_dead 0      // Used to know if human king is dead - for wounded guard in town.
  SET #air_clan_dead 0
  SET #FORBIDEN_SHOP1 0    // Used to check if npc is in shop - Miguel
  SET #FORBIDEN_SHOP2 0    // Used to check if npc is in shop - Maria
  SET #FORBIDEN_SHOP3 0    // Used to check if npc is in shop - Tafiok
  SET #FORBIDEN_SHOP4 0    // Used to check if npc is in shop - Gary_bank
  SET #FORBIDEN_SHOP5 0    // Used to check if npc is in shop - Gary_office
  SET #Alia_destiny 0    //0= RAS 1= Alia Destiny has been played
  SET #Alia_free 0      // 1= player free Alia from sacrifice
  SET #alia_dead 0
  SET #amulet_identified  0
  SET #BAG 1 //amount of bags carried by the player
  SET #bank_stollen 0
  SET #bones_in_tomb 0
  SET #CARLO_INTRODUCED 0 // so that the guards say go and talk to carlo
  SET #CINEMATICS 0   // 1 = Erzog_die played  2 = AKBAA_C played
  SET #crypt_l21_open 0
  SET #dead_hermit_quest 0
  SET #DISSIDENT_ENEMY 0
  SET #DISSIDENT 0
  SET #dragon_egg 0
  SET #FINANCE 0
  SET #FALAN_KEY 0      // Used to know if Felnor has given Falan's room key to player
  SET #weapon_enchanted_equiped 0
  SET #weapon_enchanted 0 // 1= By snake_women 2= By player
  SET #gambling 0
  SET #GARLIC_EATEN 0    // human females flee if player has eaten garlic...
  SET #guardpost_stuck 0
  SET #HELPED_KULTAR 0
  SET #intro_played 0  // intro part 2
  SET #KINGDOM_ENEMY 0
  SET #KNOW_CLUB 0      // player has heard about fight club    
  SET #krahoz_free 0    // player can go and take Krahoz
  SET #krahoz_stolen 0
  SET #look_for_shany 0    // 1= player searching 2= shani free 3= shani dead
  SET #NEED_DRAGON_EGG 0
  SET #need_form 0
  SET #need_krahoz 0
  SET #need_shield 0    // Alia asked for shield
  SET #need_superweapon 0
  SET #need_zohark 0
  SET #NEGATE 0
  SET #OLIVER_QUEST 0
  SET #player_knows_password 0  // used for the Temple of Akbaa
  SET #PLAYER_ON_QUEST 0  
    // For main quest
    // 0= start of game
    // 1= King asks the player to go to POG
    // 2= find murderer
    // 3= must find temple and destroy statue
    // 4= player has touched statue -> look for K and Z
    // 5= none
    // 6= the meteor has been destroyed (with K and Z), INVASION
    // 7= castle free -> loofs for ultimate weapon
  SET #POLSIUS_SIGNED 0
  SET #POLSIUS_TAVERN 0
  SET #NOBADGE 0      // Used to chek if player is goblin's enemy if no gem dealer badge
  SET #POXSELLIS_HELMET_ON 0  // player wears helmet
  SET #QUEEN_QUEST 0    // Status 1= still looking 2= found guilty
  SET #REPEL 0
  SET #RINCO_DEAD 0    // Used to know if Rinco can appear in two different levels
  SET #read_book 0      // Used to know if player knows number of dragon' scales
  SET #CINE_SYLIB 0
  SET #SEEN_BANK_KEY 0
  SET #shield_elder_retrieved 0  // Player's found shield
  SET #snake_enemy 0
  SET #SNAKE_TELEPORT0 0
  SET #SNAKE_TELEPORT1 0
  SET #SNAKE_TELEPORT11 0
  SET #SNAKE_TELEPORT18 0
  SET #SNAKE_TELEPORT2 0
  SET #SNAKE_TELEPORT3 0
  SET #SNAKE_TELEPORT5 0
  SET #SNAKE_TELEPORT6 0
  SET #SNAKE_TELEPORT7 0
  SET #skip_cinematic 0
  SET #statue_destroyed 0
  SET #statue_touched 0
  SET #superweapon 0
  SET #talked2greu 0    // 1= player talked to greu 2=player knows gift 2=Greu has gift
  SET #treasure_gob_found 0
  SET #troll_amulet 0
  SET #troll_enemy 0
  SET #troll_quest 0    // If= 2 passage unstuck and king sets to 3
  SET #TROLLHERO 0
  SET #TUTORIAL_MAGIC 0        // 1 = rune trouvée 2 = rune equipee 3 = book ouvert en section magie 4 = book refermé 5 = premier sort caste
  SET #TUTORIAL_SCROLL 0       //1 = Scroll Trouvé 2 = Scroll utilisé
  SET #twin_secret_discovered 0
  SET #water_clan_dead 0
  SET #secretL17_open 0
  SET #zalnashh_dead 0 //1 = Zalnashh est morte elle n'apparait pas dans le denouement
  SET $superweapon_id "NOWEAPON"
  SET #level_up 0
  SET $TMP "NONE"
  SET &TMP 0

  ACCEPT
}

ON HALO {
  IF (^$PARAM1 == "ON") {
    HALO -os 80
    ACCEPT
  }

  HALO -f
  ACCEPT
}

ON OUCH {
  HEROSAY -d ^#PARAM1
  IF (^#PARAM1 > 20) {
    SPEAK [Player_ouch_strong] NOP
  } ELSE IF (^#PARAM1 > 8) {
    SPEAK [Player_ouch_medium] NOP
  } ELSE IF (^#PARAM1 > 2) {
    SPEAK [Player_ouch] NOP
  }
  IF (§fightnow == 0) {
    SET §fightnow 1
    TIMERzgeg 1 5 SET §fightnow 0
  }
  IF (§fighting_amb == 1) {
    ACCEPT
  }
  SET §fighting_amb 1
  AMBIANCE -v 90 ambient_fight
  HEROSAY -d "START"
  TIMERambfight 1 10 GOTO AMBIANCE_FIGHT_END
  ACCEPT
}

ON SPELLCAST {
  IF (#TUTORIAL_MAGIC > 11) {
    ACCEPT
  }
  IF (^SENDER != PLAYER) {
    ACCEPT
  }
  SET #TUTORIAL_MAGIC 12
  PLAY "system"
  HEROSAY [system_tutorial_10_bis]
  ACCEPT
}

>>AMBIANCE_FIGHT_END {
  IF (§fightnow == 0) {
    GOTO AMBIANCE_DOWN
  }
  TIMERbizare 1 10 GOTO AMBIANCE_FIGHT_END
  ACCEPT
}

ON DIE {
  IF (§fighting_amb == 1) {
    TIMERambfight OFF
    AMBIANCE -v 0 ambient_fight
  }
  PLAY "player_death"
  SET #TMP ~^RND_10~
  INC #TMP 1
  IF (#TMP < 3) {
    SPEAK -p [player_dying] nop
    ACCEPT
  }
  IF (#TMP < 6) {
    SPEAK -p [Player_ouch_strong] nop
    ACCEPT
  }
  IF (#TMP < 8) {
    SPEAK -p [Player_ouch_medium] nop
    ACCEPT
  }
  ACCEPT
}

>>AMBIANCE_UP {
  INC §vol 10
  IF (§vol > 100) {
    SET §vol 100
  }
  ACCEPT
}

>>AMBIANCE_DOWN {
  HEROSAY -d "STOP"
  DEC §vol 10
  IF (§vol < 0) {
    SET §vol 0
    SET §fighting_amb 0
  }
  AMBIANCE -v 0 ambient_fight
  ACCEPT
}

ON BOOK_OPEN {
  IF (#level_up == 1) {
    SET #level_up 2
    PLAY "System"
    HEROSAY [system_tutorial_level_02]
    QUEST [system_tutorial_level_02]
    ACCEPT
  }
  IF (#TUTORIAL_MAGIC == 9) {
    SET #TUTORIAL_MAGIC 10
    BOOK -e CHANGE
    PLAY "system"
    HEROSAY [system_tutorial_9]
    ACCEPT
  }
  ACCEPT
}

ON BOOK_CLOSE {
  IF (#TUTORIAL_MAGIC == 10) {
    SET #TUTORIAL_MAGIC 11
    PLAY "system"
    HEROSAY [system_tutorial_10]
    ACCEPT
  }
  ACCEPT
}

ON INVENTORYOUT { 
  IF (^SENDER ISCLASS RUNE_AAM) {
    IF (#TUTORIAL_MAGIC == 1) {
      DEC #TUTORIAL_MAGIC 1
    }
    ACCEPT
  }
  ACCEPT
}

ON LEVEL_UP {
  IF (#level_up > 0) {
    ACCEPT
  }
  HEROSAY [system_tutorial_level_01]
  QUEST [system_tutorial_level_01]
  SET #level_up 1
  ACCEPT
}

ON DRINK_WINE {
  INC #DRUNK 1
  TIMERdrunk 0 30 GOTO DRUNK
  IF ( #DRUNK > 2 ) {
    TIMERwine OFF
    TIMERwine1 OFF
    TIMERwine 10 2 WORLD_FADE OUT 1500 0.5 0 0.2
    TIMER 1 1 TIMERwine1 15 2 WORLD_FADE IN 2500
  }
  ACCEPT
}

>>DRUNK {
  DEC #DRUNK 1
  IF (#DRUNK == 0) TIMERdrunk OFF
  ACCEPT
}

ON TADA {
  PLAY SYSTEM
  ACCEPT
}

ON TADA2 {
  PLAY BELL
  ACCEPT
}

ON TADA3 {
  PLAY ylside_gingle
  ACCEPT
}

ON TADA4 {
  PLAY snake_arrival
  ACCEPT
}

ON EARTH_QUAKE {
  PLAY earthQ
  ACCEPT
}

ON GIVE_ID {
  SET $superweapon_id ~^SENDER~
  ACCEPT
}

ON GHOST {
  PHYSICAL OFF
  COLLISION OFF
  ACCEPT
}

ON BACKSTAB {
  HEROSAY [player_backstab]
  ACCEPT
}

ON STEALTUT {
  SET §stealtut 1
  ACCEPT
}

ON COLLIDE_NPC {
  IF (§stealtut == 1) {
    SETEVENT COLLIDE_NPC OFF
    HEROSAY [tutorial_steal]
    QUEST [tutorial_steal]
    ACCEPT
  }
  ACCEPT
}

ON CURSORMODE {
  IF (#donea == 1) {
    SETEVENT CURSORMODE OFF 
    ACCEPT
  }
  SET #donea 1
  HEROSAY [tutorial_mode_01]
  SETEVENT CURSORMODE OFF 
  ACCEPT
}

ON EXPLORATIONMODE {
  IF (#doneb == 1) {
    SETEVENT EXPLORATIONMODE OFF
    ACCEPT
  }
  SET #doneb 1
  HEROSAY [tutorial_mode_02]
  SETEVENT EXPLORATIONMODE OFF
  ACCEPT
}

ON UNSETTUTO {
  SET #donea 1
  SET #doneb 1
  ACCEPT
}

ON CRITICAL {
  HEROSAY [player_dbldmg]
  SPEAK [player_attack_1handed_weap] NOP
  ACCEPT
}
      `;
    }),
    createRootItem
  )(items.npc.player);
};

module.exports = {
  overridePlayerScript,
};
