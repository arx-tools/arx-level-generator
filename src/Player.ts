import path from 'node:path'
import { Rotation } from '@src/Rotation.js'
import { Script } from '@src/Script.js'
import type { Settings } from '@src/Settings.js'
import { Vector3 } from '@src/Vector3.js'
import { LoadAnim } from '@scripting/commands/LoadAnim.js'

export class Player {
  orientation: Rotation
  position: Vector3
  script?: Script
  /**
   * For maps created from scratch the player's position needs to be adjusted
   * as the player's position is to be at around eye level (around 180cm).
   *
   * Existing Arx levels already have the player's position tweaked.
   */
  positionAlreadyAdjusted: boolean

  constructor() {
    this.orientation = new Rotation(0, 0, 0)
    this.position = new Vector3(0, 0, 0)
    this.positionAlreadyAdjusted = false
  }

  hasScript(): this is { script: Script } {
    return this.script !== undefined
  }

  withScript(): this {
    if (this.hasScript()) {
      return this
    }

    this.script = new Script({
      filename: 'player.asl',
    })

    this.script
      .on('init', new LoadAnim('wait', 'player_wait_short'))
      .on('init', new LoadAnim('wait_short', 'player_wait_1st'))
      .on('init', new LoadAnim('walk', 'human_normal_walk'))
      .on('init', new LoadAnim('walk_ministep', 'human_normal_walk_little_steps'))
      .on('init', new LoadAnim('strafe_right', 'human_normal_strafe_right'))
      .on('init', new LoadAnim('strafe_left', 'human_normal_strafe_left'))
      .on('init', new LoadAnim('walk_backward', 'human_normal_walk_backward'))
      .on('init', new LoadAnim('run', 'player_normal_run_test'))
      .on('init', new LoadAnim('run_backward', 'player_normal_run_backward_test'))
      .on('init', new LoadAnim('strafe_run_right', 'player_normal_strafe_run_right'))
      .on('init', new LoadAnim('strafe_run_left', 'player_normal_strafe_run_left'))
      .on('init', new LoadAnim('u_turn_left', 'player_uturn_left'))
      .on('init', new LoadAnim('u_turn_right', 'player_uturn_right'))
      .on('init', new LoadAnim('u_turn_left_fight', 'player_uturn_left_fight'))
      .on('init', new LoadAnim('u_turn_right_fight', 'player_uturn_right_fight'))
      .on('init', new LoadAnim('fight_wait', 'human_fight_wait_player'))
      .on('init', new LoadAnim('fight_walk_forward', 'player_fight_walk'))
      .on('init', new LoadAnim('fight_walk_backward', 'player_fight_walk_backward'))
      .on('init', new LoadAnim('fight_strafe_right', 'player_fight_strafe_right'))
      .on('init', new LoadAnim('fight_strafe_left', 'player_fight_strafe_left'))
      .on('init', new LoadAnim('bare_ready', 'human_fight_ready_noweap'))
      .on('init', new LoadAnim('bare_unready', 'human_fight_unready_noweap'))
      .on('init', new LoadAnim('bare_wait', 'human_fight_wait_noweap'))
      .on('init', new LoadAnim('bare_strike_right_start', 'human_fight_attack_noweap_right_start'))
      .on('init', new LoadAnim('bare_strike_right_cycle', 'human_fight_attack_noweap_right_cycle'))
      .on('init', new LoadAnim('bare_strike_right', 'human_fight_attack_noweap_right_strike'))
      .on('init', new LoadAnim('bare_strike_left_start', 'human_fight_attack_noweap_left_start'))
      .on('init', new LoadAnim('bare_strike_left_cycle', 'human_fight_attack_noweap_left_cycle'))
      .on('init', new LoadAnim('bare_strike_left', 'human_fight_attack_noweap_left_strike'))
      .on('init', new LoadAnim('bare_strike_bottom_start', 'human_fight_attack_noweap_top_start'))
      .on('init', new LoadAnim('bare_strike_bottom_cycle', 'human_fight_attack_noweap_top_cycle'))
      .on('init', new LoadAnim('bare_strike_bottom', 'human_fight_attack_noweap_top_strike'))
      .on('init', new LoadAnim('bare_strike_top_start', 'human_fight_attack_noweap_bottom_start'))
      .on('init', new LoadAnim('bare_strike_top_cycle', 'human_fight_attack_noweap_bottom_cycle'))
      .on('init', new LoadAnim('bare_strike_top', 'human_fight_attack_noweap_bottom_strike'))
      .on('init', new LoadAnim('1h_ready_part_1', 'human_fight_ready_1handed_start'))
      .on('init', new LoadAnim('1h_ready_part_2', 'human_fight_ready_1handed_end'))
      .on('init', new LoadAnim('1h_unready_part_1', 'human_fight_unready_1handed_start'))
      .on('init', new LoadAnim('1h_unready_part_2', 'human_fight_unready_1handed_end'))
      .on('init', new LoadAnim('1h_wait', 'human_fight_wait_1handed'))
      .on('init', new LoadAnim('1h_strike_right_start', 'human_fight_attack_1handed_left_start'))
      .on('init', new LoadAnim('1h_strike_right_cycle', 'human_fight_attack_1handed_left_cycle'))
      .on('init', new LoadAnim('1h_strike_right', 'human_fight_attack_1handed_left_strike'))
      .on('init', new LoadAnim('1h_strike_left_start', 'human_fight_attack_1handed_right_start'))
      .on('init', new LoadAnim('1h_strike_left_cycle', 'human_fight_attack_1handed_right_cycle'))
      .on('init', new LoadAnim('1h_strike_left', 'human_fight_attack_1handed_right_strike'))
      .on('init', new LoadAnim('1h_strike_top_start', 'human_fight_attack_1handed_top_start'))
      .on('init', new LoadAnim('1h_strike_top_cycle', 'human_fight_attack_1handed_top_cycle'))
      .on('init', new LoadAnim('1h_strike_top', 'human_fight_attack_1handed_top_strike'))
      .on('init', new LoadAnim('1h_strike_bottom_start', 'human_fight_attack_1handed_bottom_start'))
      .on('init', new LoadAnim('1h_strike_bottom_cycle', 'human_fight_attack_1handed_bottom_cycle'))
      .on('init', new LoadAnim('1h_strike_bottom', 'human_fight_attack_1handed_bottom_strike'))
      .on('init', new LoadAnim('2h_ready_part_1', 'human_fight_ready_2handed_start'))
      .on('init', new LoadAnim('2h_ready_part_2', 'human_fight_ready_2handed_end'))
      .on('init', new LoadAnim('2h_unready_part_1', 'human_fight_unready_2handed_start'))
      .on('init', new LoadAnim('2h_unready_part_2', 'human_fight_unready_2handed_end'))
      .on('init', new LoadAnim('2h_wait', 'human_fight_wait_2handed'))
      .on('init', new LoadAnim('2h_strike_right_start', 'human_fight_attack_2handed_right_start'))
      .on('init', new LoadAnim('2h_strike_right_cycle', 'human_fight_attack_2handed_right_cycle'))
      .on('init', new LoadAnim('2h_strike_right', 'human_fight_attack_2handed_right_strike'))
      .on('init', new LoadAnim('2h_strike_left_start', 'human_fight_attack_2handed_left_start'))
      .on('init', new LoadAnim('2h_strike_left_cycle', 'human_fight_attack_2handed_left_cycle'))
      .on('init', new LoadAnim('2h_strike_left', 'human_fight_attack_2handed_left_strike'))
      .on('init', new LoadAnim('2h_strike_top_start', 'human_fight_attack_2handed_top_start'))
      .on('init', new LoadAnim('2h_strike_top_cycle', 'human_fight_attack_2handed_top_cycle'))
      .on('init', new LoadAnim('2h_strike_top', 'human_fight_attack_2handed_top_strike'))
      .on('init', new LoadAnim('2h_strike_bottom_start', 'human_fight_attack_2handed_bottom_start'))
      .on('init', new LoadAnim('2h_strike_bottom_cycle', 'human_fight_attack_2handed_bottom_cycle'))
      .on('init', new LoadAnim('2h_strike_bottom', 'human_fight_attack_2handed_bottom_strike'))
      .on('init', new LoadAnim('dagger_ready_part_1', 'human_fight_ready_dagger_start'))
      .on('init', new LoadAnim('dagger_ready_part_2', 'human_fight_ready_dagger_end'))
      .on('init', new LoadAnim('dagger_unready_part_1', 'human_fight_unready_dagger_start'))
      .on('init', new LoadAnim('dagger_unready_part_2', 'human_fight_unready_dagger_end'))
      .on('init', new LoadAnim('dagger_wait', 'human_fight_attack_dagger_wait'))
      .on('init', new LoadAnim('dagger_strike_right_start', 'human_fight_attack_dagger_right_start'))
      .on('init', new LoadAnim('dagger_strike_right_cycle', 'human_fight_attack_dagger_right_cycle'))
      .on('init', new LoadAnim('dagger_strike_right', 'human_fight_attack_dagger_right_strike'))
      .on('init', new LoadAnim('dagger_strike_left_start', 'human_fight_attack_dagger_left_start'))
      .on('init', new LoadAnim('dagger_strike_left_cycle', 'human_fight_attack_dagger_left_cycle'))
      .on('init', new LoadAnim('dagger_strike_left', 'human_fight_attack_dagger_left_strike'))
      .on('init', new LoadAnim('dagger_strike_top_start', 'human_fight_attack_dagger_top_start'))
      .on('init', new LoadAnim('dagger_strike_top_cycle', 'human_fight_attack_dagger_top_cycle'))
      .on('init', new LoadAnim('dagger_strike_top', 'human_fight_attack_dagger_top_strike'))
      .on('init', new LoadAnim('dagger_strike_bottom_start', 'human_fight_attack_dagger_bottom_start'))
      .on('init', new LoadAnim('dagger_strike_bottom_cycle', 'human_fight_attack_dagger_bottom_cycle'))
      .on('init', new LoadAnim('dagger_strike_bottom', 'human_fight_attack_dagger_bottom_strike'))
      .on('init', new LoadAnim('missile_ready_part_1', 'human_fight_ready_bow_start'))
      .on('init', new LoadAnim('missile_ready_part_2', 'human_fight_ready_bow_end'))
      .on('init', new LoadAnim('missile_unready_part_1', 'human_fight_unready_bow_start'))
      .on('init', new LoadAnim('missile_unready_part_2', 'human_fight_unready_bow_end'))
      .on('init', new LoadAnim('missile_wait', 'human_fight_wait_bow'))
      .on('init', new LoadAnim('missile_strike_part_1', 'human_fight_attack_bow_start_part1'))
      .on('init', new LoadAnim('missile_strike_part_2', 'human_fight_attack_bow_start_part2'))
      .on('init', new LoadAnim('missile_strike_cycle', 'human_fight_attack_bow_cycle'))
      .on('init', new LoadAnim('missile_strike', 'human_fight_attack_bow_strike'))
      .on('init', new LoadAnim('shield_start', 'human_fight_shield_in'))
      .on('init', new LoadAnim('shield_cycle', 'human_fight_shield_cycle'))
      .on('init', new LoadAnim('shield_hit', 'human_fight_shield_hit'))
      .on('init', new LoadAnim('shield_end', 'human_fight_shield_out'))
      .on('init', new LoadAnim('cast_start', 'human_castspell_in'))
      .on('init', new LoadAnim('cast_cycle', 'human_castspell_cycle'))
      .on('init', new LoadAnim('cast', 'human_castspell_cast'))
      .on('init', new LoadAnim('cast_end', 'human_castspell_out'))
      .on('init', new LoadAnim('meditation', 'human_meditation'))
      .on('init', new LoadAnim('levitate', 'human_levitation'))
      .on('init', new LoadAnim('crouch_start', 'human_normal_crouch_in'))
      .on('init', new LoadAnim('crouch_wait', 'human_normal_crouch_cycle'))
      .on('init', new LoadAnim('crouch_end', 'human_normal_crouch_out'))
      .on('init', new LoadAnim('crouch_strafe_right', 'human_normal_crouch_strafe_right'))
      .on('init', new LoadAnim('crouch_strafe_left', 'human_normal_crouch_strafe_left'))
      .on('init', new LoadAnim('crouch_walk', 'human_normal_crouch_walk_forward'))
      .on('init', new LoadAnim('crouch_walk_backward', 'human_normal_crouch_walk_backward'))
      .on('init', new LoadAnim('lean_left', 'human_normal_lean_right_in'))
      .on('init', new LoadAnim('lean_right', 'human_normal_lean_left_in'))
      .on('init', new LoadAnim('jump_anticipation', 'human_normal_jump_part1_anticipation'))
      .on('init', new LoadAnim('jump_up', 'human_normal_jump_part2_jumpup'))
      .on('init', new LoadAnim('jump_cycle', 'human_normal_jump_part3_cycleinair'))
      .on('init', new LoadAnim('jump_end', 'human_normal_jump_part4_landing'))
      .on('init', new LoadAnim('jump_end_part2', 'human_normal_jump_part5_contact_floor'))
      .on('init', new LoadAnim('hold_torch', 'human_hold_torch_toponly'))
      .on('init', new LoadAnim('die', 'human_death5'))
      .on('init', new LoadAnim('hit', 'human_fight_receive_damage'))
      .on('init', new LoadAnim('talk_neutral', 'human_talk_neutral_headonly'))
      .on('init', new LoadAnim('talk_angry', 'human_talk_angry_headonly'))

    return this
  }

  /**
   * @throws Error when player doesn't have a script
   */
  exportTarget(settings: Settings): string {
    if (!this.hasScript()) {
      throw new Error("trying to export a Player which doesn't have a script")
    }

    return path.resolve(settings.outputDir, Script.targetPath, 'player', this.script.filename)
  }
}
