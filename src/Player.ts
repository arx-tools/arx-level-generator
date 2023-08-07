import path from 'node:path'
import { Rotation } from '@src/Rotation.js'
import { Script } from '@src/Script.js'
import { Settings } from '@src/Settings.js'
import { Vector3 } from '@src/Vector3.js'
import { LoadAnim } from '@scripting/commands/LoadAnim.js'

export class Player {
  orientation: Rotation
  position: Vector3
  script?: Script

  constructor() {
    this.orientation = new Rotation(0, 0, 0)
    this.position = new Vector3(0, 0, 0)
  }

  hasScript(): this is { script: Script } {
    return typeof this.script !== 'undefined'
  }

  withScript() {
    if (this.hasScript()) {
      return this
    }

    this.script = new Script({
      filename: 'player.asl',
    })

    this.script.on('init', new LoadAnim('wait', 'player_wait_short'))
    this.script.on('init', new LoadAnim('wait_short', 'player_wait_1st'))
    this.script.on('init', new LoadAnim('walk', 'human_normal_walk'))
    this.script.on('init', new LoadAnim('walk_ministep', 'human_normal_walk_little_steps'))
    this.script.on('init', new LoadAnim('strafe_right', 'human_normal_strafe_right'))
    this.script.on('init', new LoadAnim('strafe_left', 'human_normal_strafe_left'))
    this.script.on('init', new LoadAnim('walk_backward', 'human_normal_walk_backward'))
    this.script.on('init', new LoadAnim('run', 'player_normal_run_test'))
    this.script.on('init', new LoadAnim('run_backward', 'player_normal_run_backward_test'))
    this.script.on('init', new LoadAnim('strafe_run_right', 'player_normal_strafe_run_right'))
    this.script.on('init', new LoadAnim('strafe_run_left', 'player_normal_strafe_run_left'))
    this.script.on('init', new LoadAnim('u_turn_left', 'player_uturn_left'))
    this.script.on('init', new LoadAnim('u_turn_right', 'player_uturn_right'))
    this.script.on('init', new LoadAnim('u_turn_left_fight', 'player_uturn_left_fight'))
    this.script.on('init', new LoadAnim('u_turn_right_fight', 'player_uturn_right_fight'))
    this.script.on('init', new LoadAnim('fight_wait', 'human_fight_wait_player'))
    this.script.on('init', new LoadAnim('fight_walk_forward', 'player_fight_walk'))
    this.script.on('init', new LoadAnim('fight_walk_backward', 'player_fight_walk_backward'))
    this.script.on('init', new LoadAnim('fight_strafe_right', 'player_fight_strafe_right'))
    this.script.on('init', new LoadAnim('fight_strafe_left', 'player_fight_strafe_left'))
    this.script.on('init', new LoadAnim('bare_ready', 'human_fight_ready_noweap'))
    this.script.on('init', new LoadAnim('bare_unready', 'human_fight_unready_noweap'))
    this.script.on('init', new LoadAnim('bare_wait', 'human_fight_wait_noweap'))
    this.script.on('init', new LoadAnim('bare_strike_right_start', 'human_fight_attack_noweap_right_start'))
    this.script.on('init', new LoadAnim('bare_strike_right_cycle', 'human_fight_attack_noweap_right_cycle'))
    this.script.on('init', new LoadAnim('bare_strike_right', 'human_fight_attack_noweap_right_strike'))
    this.script.on('init', new LoadAnim('bare_strike_left_start', 'human_fight_attack_noweap_left_start'))
    this.script.on('init', new LoadAnim('bare_strike_left_cycle', 'human_fight_attack_noweap_left_cycle'))
    this.script.on('init', new LoadAnim('bare_strike_left', 'human_fight_attack_noweap_left_strike'))
    this.script.on('init', new LoadAnim('bare_strike_bottom_start', 'human_fight_attack_noweap_top_start'))
    this.script.on('init', new LoadAnim('bare_strike_bottom_cycle', 'human_fight_attack_noweap_top_cycle'))
    this.script.on('init', new LoadAnim('bare_strike_bottom', 'human_fight_attack_noweap_top_strike'))
    this.script.on('init', new LoadAnim('bare_strike_top_start', 'human_fight_attack_noweap_bottom_start'))
    this.script.on('init', new LoadAnim('bare_strike_top_cycle', 'human_fight_attack_noweap_bottom_cycle'))
    this.script.on('init', new LoadAnim('bare_strike_top', 'human_fight_attack_noweap_bottom_strike'))
    this.script.on('init', new LoadAnim('1h_ready_part_1', 'human_fight_ready_1handed_start'))
    this.script.on('init', new LoadAnim('1h_ready_part_2', 'human_fight_ready_1handed_end'))
    this.script.on('init', new LoadAnim('1h_unready_part_1', 'human_fight_unready_1handed_start'))
    this.script.on('init', new LoadAnim('1h_unready_part_2', 'human_fight_unready_1handed_end'))
    this.script.on('init', new LoadAnim('1h_wait', 'human_fight_wait_1handed'))
    this.script.on('init', new LoadAnim('1h_strike_right_start', 'human_fight_attack_1handed_left_start'))
    this.script.on('init', new LoadAnim('1h_strike_right_cycle', 'human_fight_attack_1handed_left_cycle'))
    this.script.on('init', new LoadAnim('1h_strike_right', 'human_fight_attack_1handed_left_strike'))
    this.script.on('init', new LoadAnim('1h_strike_left_start', 'human_fight_attack_1handed_right_start'))
    this.script.on('init', new LoadAnim('1h_strike_left_cycle', 'human_fight_attack_1handed_right_cycle'))
    this.script.on('init', new LoadAnim('1h_strike_left', 'human_fight_attack_1handed_right_strike'))
    this.script.on('init', new LoadAnim('1h_strike_top_start', 'human_fight_attack_1handed_top_start'))
    this.script.on('init', new LoadAnim('1h_strike_top_cycle', 'human_fight_attack_1handed_top_cycle'))
    this.script.on('init', new LoadAnim('1h_strike_top', 'human_fight_attack_1handed_top_strike'))
    this.script.on('init', new LoadAnim('1h_strike_bottom_start', 'human_fight_attack_1handed_bottom_start'))
    this.script.on('init', new LoadAnim('1h_strike_bottom_cycle', 'human_fight_attack_1handed_bottom_cycle'))
    this.script.on('init', new LoadAnim('1h_strike_bottom', 'human_fight_attack_1handed_bottom_strike'))
    this.script.on('init', new LoadAnim('2h_ready_part_1', 'human_fight_ready_2handed_start'))
    this.script.on('init', new LoadAnim('2h_ready_part_2', 'human_fight_ready_2handed_end'))
    this.script.on('init', new LoadAnim('2h_unready_part_1', 'human_fight_unready_2handed_start'))
    this.script.on('init', new LoadAnim('2h_unready_part_2', 'human_fight_unready_2handed_end'))
    this.script.on('init', new LoadAnim('2h_wait', 'human_fight_wait_2handed'))
    this.script.on('init', new LoadAnim('2h_strike_right_start', 'human_fight_attack_2handed_right_start'))
    this.script.on('init', new LoadAnim('2h_strike_right_cycle', 'human_fight_attack_2handed_right_cycle'))
    this.script.on('init', new LoadAnim('2h_strike_right', 'human_fight_attack_2handed_right_strike'))
    this.script.on('init', new LoadAnim('2h_strike_left_start', 'human_fight_attack_2handed_left_start'))
    this.script.on('init', new LoadAnim('2h_strike_left_cycle', 'human_fight_attack_2handed_left_cycle'))
    this.script.on('init', new LoadAnim('2h_strike_left', 'human_fight_attack_2handed_left_strike'))
    this.script.on('init', new LoadAnim('2h_strike_top_start', 'human_fight_attack_2handed_top_start'))
    this.script.on('init', new LoadAnim('2h_strike_top_cycle', 'human_fight_attack_2handed_top_cycle'))
    this.script.on('init', new LoadAnim('2h_strike_top', 'human_fight_attack_2handed_top_strike'))
    this.script.on('init', new LoadAnim('2h_strike_bottom_start', 'human_fight_attack_2handed_bottom_start'))
    this.script.on('init', new LoadAnim('2h_strike_bottom_cycle', 'human_fight_attack_2handed_bottom_cycle'))
    this.script.on('init', new LoadAnim('2h_strike_bottom', 'human_fight_attack_2handed_bottom_strike'))
    this.script.on('init', new LoadAnim('dagger_ready_part_1', 'human_fight_ready_dagger_start'))
    this.script.on('init', new LoadAnim('dagger_ready_part_2', 'human_fight_ready_dagger_end'))
    this.script.on('init', new LoadAnim('dagger_unready_part_1', 'human_fight_unready_dagger_start'))
    this.script.on('init', new LoadAnim('dagger_unready_part_2', 'human_fight_unready_dagger_end'))
    this.script.on('init', new LoadAnim('dagger_wait', 'human_fight_attack_dagger_wait'))
    this.script.on('init', new LoadAnim('dagger_strike_right_start', 'human_fight_attack_dagger_right_start'))
    this.script.on('init', new LoadAnim('dagger_strike_right_cycle', 'human_fight_attack_dagger_right_cycle'))
    this.script.on('init', new LoadAnim('dagger_strike_right', 'human_fight_attack_dagger_right_strike'))
    this.script.on('init', new LoadAnim('dagger_strike_left_start', 'human_fight_attack_dagger_left_start'))
    this.script.on('init', new LoadAnim('dagger_strike_left_cycle', 'human_fight_attack_dagger_left_cycle'))
    this.script.on('init', new LoadAnim('dagger_strike_left', 'human_fight_attack_dagger_left_strike'))
    this.script.on('init', new LoadAnim('dagger_strike_top_start', 'human_fight_attack_dagger_top_start'))
    this.script.on('init', new LoadAnim('dagger_strike_top_cycle', 'human_fight_attack_dagger_top_cycle'))
    this.script.on('init', new LoadAnim('dagger_strike_top', 'human_fight_attack_dagger_top_strike'))
    this.script.on('init', new LoadAnim('dagger_strike_bottom_start', 'human_fight_attack_dagger_bottom_start'))
    this.script.on('init', new LoadAnim('dagger_strike_bottom_cycle', 'human_fight_attack_dagger_bottom_cycle'))
    this.script.on('init', new LoadAnim('dagger_strike_bottom', 'human_fight_attack_dagger_bottom_strike'))
    this.script.on('init', new LoadAnim('missile_ready_part_1', 'human_fight_ready_bow_start'))
    this.script.on('init', new LoadAnim('missile_ready_part_2', 'human_fight_ready_bow_end'))
    this.script.on('init', new LoadAnim('missile_unready_part_1', 'human_fight_unready_bow_start'))
    this.script.on('init', new LoadAnim('missile_unready_part_2', 'human_fight_unready_bow_end'))
    this.script.on('init', new LoadAnim('missile_wait', 'human_fight_wait_bow'))
    this.script.on('init', new LoadAnim('missile_strike_part_1', 'human_fight_attack_bow_start_part1'))
    this.script.on('init', new LoadAnim('missile_strike_part_2', 'human_fight_attack_bow_start_part2'))
    this.script.on('init', new LoadAnim('missile_strike_cycle', 'human_fight_attack_bow_cycle'))
    this.script.on('init', new LoadAnim('missile_strike', 'human_fight_attack_bow_strike'))
    this.script.on('init', new LoadAnim('shield_start', 'human_fight_shield_in'))
    this.script.on('init', new LoadAnim('shield_cycle', 'human_fight_shield_cycle'))
    this.script.on('init', new LoadAnim('shield_hit', 'human_fight_shield_hit'))
    this.script.on('init', new LoadAnim('shield_end', 'human_fight_shield_out'))
    this.script.on('init', new LoadAnim('cast_start', 'human_castspell_in'))
    this.script.on('init', new LoadAnim('cast_cycle', 'human_castspell_cycle'))
    this.script.on('init', new LoadAnim('cast', 'human_castspell_cast'))
    this.script.on('init', new LoadAnim('cast_end', 'human_castspell_out'))
    this.script.on('init', new LoadAnim('meditation', 'human_meditation'))
    this.script.on('init', new LoadAnim('levitate', 'human_levitation'))
    this.script.on('init', new LoadAnim('crouch_start', 'human_normal_crouch_in'))
    this.script.on('init', new LoadAnim('crouch_wait', 'human_normal_crouch_cycle'))
    this.script.on('init', new LoadAnim('crouch_end', 'human_normal_crouch_out'))
    this.script.on('init', new LoadAnim('crouch_strafe_right', 'human_normal_crouch_strafe_right'))
    this.script.on('init', new LoadAnim('crouch_strafe_left', 'human_normal_crouch_strafe_left'))
    this.script.on('init', new LoadAnim('crouch_walk', 'human_normal_crouch_walk_forward'))
    this.script.on('init', new LoadAnim('crouch_walk_backward', 'human_normal_crouch_walk_backward'))
    this.script.on('init', new LoadAnim('lean_left', 'human_normal_lean_right_in'))
    this.script.on('init', new LoadAnim('lean_right', 'human_normal_lean_left_in'))
    this.script.on('init', new LoadAnim('jump_anticipation', 'human_normal_jump_part1_anticipation'))
    this.script.on('init', new LoadAnim('jump_up', 'human_normal_jump_part2_jumpup'))
    this.script.on('init', new LoadAnim('jump_cycle', 'human_normal_jump_part3_cycleinair'))
    this.script.on('init', new LoadAnim('jump_end', 'human_normal_jump_part4_landing'))
    this.script.on('init', new LoadAnim('jump_end_part2', 'human_normal_jump_part5_contact_floor'))
    this.script.on('init', new LoadAnim('hold_torch', 'human_hold_torch_toponly'))
    this.script.on('init', new LoadAnim('die', 'human_death5'))
    this.script.on('init', new LoadAnim('hit', 'human_fight_receive_damage'))
    this.script.on('init', new LoadAnim('talk_neutral', 'human_talk_neutral_headonly'))
    this.script.on('init', new LoadAnim('talk_angry', 'human_talk_angry_headonly'))

    return this
  }

  exportTarget(settings: Settings) {
    if (!this.hasScript()) {
      throw new Error("trying to export a Player which doesn't have a script")
    }

    return path.resolve(settings.outputDir, Script.targetPath, 'player', this.script.filename)
  }
}
