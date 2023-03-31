import path from 'node:path'
import { ScriptCommand } from '@scripting/ScriptCommand.js'
import { UsesTextures } from '@scripting/interfaces/UsesTextures.js'
import { Texture } from '@src/Texture.js'

export class TweakSkin extends ScriptCommand implements UsesTextures {
  oldTexture: Texture | Promise<Texture>
  newTexture: Texture | Promise<Texture>

  constructor(oldTexture: Texture | Promise<Texture>, newTexture: Texture | Promise<Texture>) {
    super()
    this.oldTexture = oldTexture
    this.newTexture = newTexture
  }

  async toString() {
    const oldTexture = await this.oldTexture
    const newTexture = await this.newTexture

    const oldFilename = path.parse(oldTexture.filename).name
    const newFilename = path.parse(newTexture.filename).name

    return `tweak skin "${oldFilename}" "${newFilename}"`
  }

  async exportTextures(outputDir: string) {
    let files: Record<string, string> = {}

    const oldTexture = await this.oldTexture
    const newTexture = await this.newTexture

    if (!oldTexture.isNative) {
      const [source, target] = await oldTexture.exportSourceAndTarget(outputDir, false)
      files[target] = source
    }

    if (!newTexture.isNative) {
      const [source, target] = await newTexture.exportSourceAndTarget(outputDir, false)
      files[target] = source
    }

    return files
  }
}
