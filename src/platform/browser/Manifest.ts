import { type IManifest } from '@platform/common/IManifest.js'
import { type ISettings } from '@platform/common/ISettings.js'

export class Manifest implements IManifest {
  settings: ISettings

  constructor(settings: ISettings) {
    this.settings = settings
  }

  async generate(files: string[], prettify: boolean = false): Promise<ArrayBufferLike> {
    // TODO: implement this once the browser also has a MetaData class
    return new ArrayBuffer(0)
  }
}
