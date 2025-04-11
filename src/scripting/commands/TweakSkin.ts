import type { Settings } from '@platform/common/Settings.js'
import type { Texture } from '@src/Texture.js'
import { ScriptCommand } from '@scripting/ScriptCommand.js'
import type { UsesTextures } from '@scripting/interfaces/UsesTextures.js'
import type { FileExports } from '@src/types.js'
import parsePath from 'path-parse'

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
      oldFilename = parsePath(this.oldTexture.filename).name
    }

    let newFilename: string
    if (typeof this.newTexture === 'string') {
      newFilename = this.newTexture
    } else {
      newFilename = parsePath(this.newTexture.filename).name
    }

    return `tweak skin "${oldFilename}" "${newFilename}"`
  }

  async exportTextures(settings: Settings): Promise<FileExports> {
    let files: FileExports = {}
    const { oldTexture, newTexture } = this

    if (typeof oldTexture !== 'string' && !oldTexture.isNative) {
      files = {
        ...files,
        ...(await oldTexture.exportSourceAndTarget(settings, false)),
      }
    }

    if (typeof newTexture !== 'string' && !newTexture.isNative) {
      files = {
        ...files,
        ...(await newTexture.exportSourceAndTarget(settings, false)),
      }
    }

    return files
  }
}
