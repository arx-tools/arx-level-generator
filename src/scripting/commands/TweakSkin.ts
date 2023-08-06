import path from 'node:path'
import { Settings } from '@src/Settings.js'
import { Texture } from '@src/Texture.js'
import { ScriptCommand } from '@scripting/ScriptCommand.js'
import { UsesTextures } from '@scripting/interfaces/UsesTextures.js'

export class TweakSkin extends ScriptCommand implements UsesTextures {
  oldTexture: Texture | string
  newTexture: Texture | string

  constructor(oldTexture: Texture | string, newTexture: Texture | string) {
    super()
    this.oldTexture = oldTexture
    this.newTexture = newTexture
  }

  toString() {
    const oldFilename =
      typeof this.oldTexture === 'string' ? this.oldTexture : path.parse(this.oldTexture.filename).name
    const newFilename =
      typeof this.newTexture === 'string' ? this.newTexture : path.parse(this.newTexture.filename).name

    return `tweak skin "${oldFilename}" "${newFilename}"`
  }

  async exportTextures(outputDir: string, settings: Settings) {
    let files: Record<string, string> = {}

    const oldTexture = this.oldTexture
    if (typeof oldTexture !== 'string' && !oldTexture.isNative) {
      const [source, target] = await oldTexture.exportSourceAndTarget(outputDir, false, settings)
      files[target] = source
    }

    const newTexture = this.newTexture
    if (typeof newTexture !== 'string' && !newTexture.isNative) {
      const [source, target] = await newTexture.exportSourceAndTarget(outputDir, false, settings)
      files[target] = source
    }

    return files
  }
}
