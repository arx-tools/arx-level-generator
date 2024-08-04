import path from 'node:path'
import { type Settings } from '@src/Settings.js'
import { type Texture } from '@src/Texture.js'
import { ScriptCommand } from '@scripting/ScriptCommand.js'
import { type UsesTextures } from '@scripting/interfaces/UsesTextures.js'

export class TweakSkin extends ScriptCommand implements UsesTextures {
  oldTexture: Texture | string
  newTexture: Texture | string

  constructor(oldTexture: Texture | string, newTexture: Texture | string) {
    super()
    this.oldTexture = oldTexture
    this.newTexture = newTexture
  }

  toString(): string {
    const oldFilename =
      typeof this.oldTexture === 'string' ? this.oldTexture : path.parse(this.oldTexture.filename).name
    const newFilename =
      typeof this.newTexture === 'string' ? this.newTexture : path.parse(this.newTexture.filename).name

    return `tweak skin "${oldFilename}" "${newFilename}"`
  }

  async exportTextures(settings: Settings): Promise<Record<string, string>> {
    const files: Record<string, string> = {}
    const { oldTexture, newTexture } = this

    if (typeof oldTexture !== 'string' && !oldTexture.isNative) {
      const [source, target] = await oldTexture.exportSourceAndTarget(settings, false)
      files[target] = source
    }

    if (typeof newTexture !== 'string' && !newTexture.isNative) {
      const [source, target] = await newTexture.exportSourceAndTarget(settings, false)
      files[target] = source
    }

    return files
  }
}
