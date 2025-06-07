import type { Texture } from '@src/Texture.js'
import { getFilenameFromPath } from '@src/helpers.js'
import type { FileExports } from '@src/types.js'
import type { Settings } from '@platform/common/Settings.js'
import { ScriptCommand } from '@scripting/ScriptCommand.js'
import type { UsesTextures } from '@scripting/interfaces/UsesTextures.js'

export class TweakSkin extends ScriptCommand implements UsesTextures {
  oldTexture: Texture | string
  newTexture: Texture | string

  constructor(oldTexture: Texture | string, newTexture: Texture | string) {
    super()
    this.oldTexture = oldTexture
    this.newTexture = newTexture
  }

  toString(): string {
    let oldFilename: string
    if (typeof this.oldTexture === 'string') {
      oldFilename = this.oldTexture
    } else {
      oldFilename = getFilenameFromPath(this.oldTexture.filename)
    }

    let newFilename: string
    if (typeof this.newTexture === 'string') {
      newFilename = this.newTexture
    } else {
      newFilename = getFilenameFromPath(this.newTexture.filename)
    }

    return `tweak skin "${oldFilename}" "${newFilename}"`
  }

  async exportTextures(settings: Settings): Promise<FileExports> {
    const files: FileExports = {}
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
