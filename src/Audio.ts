import fs from 'node:fs'
import path from 'node:path'
import { fileExists } from '@src/helpers.js'

type AudioConstructorProps = {
  filename: string
  isNative?: boolean
  sourcePath?: string
}

export class Audio {
  static targetPath = 'sfx'

  filename: string
  isNative: boolean
  sourcePath?: string

  constructor(props: AudioConstructorProps) {
    this.filename = props.filename
    this.isNative = props.isNative ?? true
    this.sourcePath = props.sourcePath
  }

  static async fromCustomFile() {
    // TODO: create a new Audio with custom data
    return Audio.metalOnWood2
  }

  async exportSourceAndTarget(outputDir: string) {
    if (this.isNative) {
      throw new Error('trying to export a native Audio')
    }

    return ['', '']
  }

  // ----------------

  static get spiderStep3() {
    return new Audio({ filename: 'spider_step3.wav' })
  }
  static get metalOnWood2() {
    return new Audio({ filename: 'metal_on_wood_2' })
  }
  static get sausageJump() {
    return new Audio({ filename: 'sausage_jump' })
  }
  static get footstepShoeMetalStep() {
    return new Audio({ filename: 'footstep_shoe_metal_step' })
  }
  static get interfaceInvstd() {
    return new Audio({ filename: 'interface_invstd' })
  }
  static get clothOnCloth1() {
    return new Audio({ filename: 'cloth_on_cloth_1' })
  }
}
