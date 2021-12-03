ON INIT {
 SETNAME [description_statue]
 SETSPEED 3
 SET_MATERIAL STONE
 SETDETECT 2000
 
 PHYSICAL RADIUS 30
 
 SET �idle 6
 SET �idleSoundIdx 0
 
 SET_NPC_STAT RESISTMAGIC 100
 SET_NPC_STAT RESISTPOISON 100
 SET_NPC_STAT RESISTFIRE 100
 
 SET_NPC_STAT life 1000
 
 LOADANIM ACTION1 "statue_wait_4"
 // LOADANIM ACTION2 "Statue_rotate" 
 LOADANIM WAIT "Statue_wait"
 LOADANIM WALK "snake_woman_normal_walk"
 LOADANIM RUN "snake_woman_normal_run"
 
 BEHAVIOR NONE
 SETTARGET PLAYER
 
 TWEAK SKIN "FIXINTER_STATUE01" "DEMON_STATUE"
 
 PLAYANIM WAIT
 
 SET #TMP 7
 TIMERmisc_reflection -i 0 ~#TMP~ SENDEVENT IDLE SELF ""

 SENDEVENT IDLE SELF ""
 SET_EVENT HEAR ON

 ACCEPT
}

ON IDLE {
  INC �idleSoundIdx 1
  IF (�idleSoundIdx == 5) {
    SET �idleSoundIdx 1
  }
  
  IF (�idle == 0) {
	ACCEPT
  }
  
  IF (�idleSoundIdx == 1) {
	PLAY -p "statue_idle1"
  }

  IF (�idleSoundIdx == 2) {
    PLAY -p "statue_idle2"
  }
  
  IF (�idleSoundIdx == 3) {
    PLAY -p "statue_idle1"
  }
  
  IF (�idleSoundIdx == 3) {
    PLAY -p "statue_idle3"
  }

  ACCEPT
}

ON HEAR {
  // HEROSAY "I hear you!"

  BEHAVIOR MOVE_TO
  SETTARGET -n ^SENDER
  SETMOVEMODE WALK
  
  IF (�idle == 1) {
    SET �idle 0
	
	IF (�idleSoundIdx == 1) {
		PLAY -p "statue_jumpscare1"
	  }
	  IF (�idleSoundIdx == 2) {
		PLAY -p "statue_jumpscare2"
	  }
	  IF (�idleSoundIdx == 3) {
		PLAY -p "statue_jumpscare1"
	  }
	  IF (�idleSoundIdx == 4) {
	    PLAY -p "statue_jumpscare2"
	  }
  }
  
  ACCEPT
}

ON DETECTPLAYER {
  >>PLAYER_DETECTED
  
  IF (�idleSoundIdx == 1) {
	PLAY -p "statue_jumpscare1"
  }
  IF (�idleSoundIdx == 2) {
	PLAY -p "statue_jumpscare2"
  }
  IF (�idleSoundIdx == 3) {
	PLAY -p "statue_jumpscare1"
  }
  IF (�idleSoundIdx == 4) {
	PLAY -p "statue_jumpscare2"
  }
  
  GOTO ATTACK_PLAYER
  
  ACCEPT
}

ON ATTACK_PLAYER {
  GOTO ATTACK_PLAYER
  ACCEPT
}

>>ATTACK_PLAYER {
  // HEROSAY "Attack player!"
  
  WEAPON ON
  SET_EVENT HEAR OFF
  BEHAVIOR -f MOVE_TO
  SETTARGET PLAYER
  SETMOVEMODE RUN
  
  ACCEPT
}

ON REACHEDTARGET 
{
 IF (^TARGET == PLAYER) 
 {
   DO_DAMAGE ~^SENDER~ 1000
 }
 ACCEPT
}

ON MOVE {
  SETMOVEMODE WALK
  ACCEPT
}

ON LOSTTARGET {
  GOTO LOOK_FOR
  ACCEPT
}

ON LOOK_FOR {
  GOTO LOOK_FOR
  ACCEPT
}

ON UNDETECTPLAYER {
  GOTO LOOK_FOR
  ACCEPT
}

>>LOOK_FOR {
  // HEROSAY "Looking for ya!"
  
  IF (^DIST_PLAYER < 500) GOTO PLAYER_DETECTED
 
  BEHAVIOR LOOK_FOR 500
  SETTARGET PLAYER
  SETMOVEMODE WALK

  SET_EVENT HEAR ON
  
  TIMERhome 1 18 GOTO GO_HOME

  ACCEPT
}

>>GO_HOME {
  BEHAVIOR NONE
  SETTARGET PLAYER

  SET �idle 1

  ACCEPT
}

ON COLLIDE_NPC {
  IF (^SENDER == PLAYER) {
    DO_DAMAGE ~^SENDER~ 1000
  }
  ACCEPT
}

// ON DIE {
  // FORCEANIM DIE
  // ACCEPT
// }

// ON REACHEDTARGET {
  // GOTO PLAYER_DETECTED
  // ACCEPT
// }

// ON OUCH {
  
  // ACCEPT
// }