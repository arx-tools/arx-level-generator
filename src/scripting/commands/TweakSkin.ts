import path from 'node:path'
import { Texture } from '@src/Texture.js'
import { ScriptCommand } from '@scripting/ScriptCommand.js'
import { UsesTextures } from '@scripting/interfaces/UsesTextures.js'

export class TweakSkin extends ScriptCommand implements UsesTextures {
  oldTexture: Texture | Promise<Texture> | string
  newTexture: Texture | Promise<Texture> | string

  constructor(oldTexture: Texture | Promise<Texture> | string, newTexture: Texture | Promise<Texture> | string) {
    super()
    this.oldTexture = oldTexture
    this.newTexture = newTexture
  }

  async toString() {
    const oldTexture = await this.oldTexture
    const newTexture = await this.newTexture

    const oldFilename = typeof oldTexture === 'string' ? oldTexture : path.parse(oldTexture.filename).name
    const newFilename = typeof newTexture === 'string' ? newTexture : path.parse(newTexture.filename).name

    return `tweak skin "${oldFilename}" "${newFilename}"`
  }

  async exportTextures(outputDir: string) {
    let files: Record<string, string> = {}

    const oldTexture = await this.oldTexture
    if (typeof oldTexture !== 'string' && !oldTexture.isNative) {
      const [source, target] = await oldTexture.exportSourceAndTarget(outputDir, false)
      files[target] = source
    }

    const newTexture = await this.newTexture
    if (typeof newTexture !== 'string' && !newTexture.isNative) {
      const [source, target] = await newTexture.exportSourceAndTarget(outputDir, false)
      files[target] = source
    }

    return files
  }
}
