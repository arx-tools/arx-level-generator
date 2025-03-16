import type { Manifest as IManifest } from '@platform/common/Manifest.js'
import type { Settings } from '@platform/common/Settings.js'

export class Manifest implements IManifest {
  settings: Settings

  constructor(settings: Settings) {
    this.settings = settings
  }

  async generate(files: string[], prettify: boolean = false): Promise<ArrayBufferLike> {
    // TODO: implement this once the browser also has a MetaData class
    return new ArrayBuffer(0)
  }
}
