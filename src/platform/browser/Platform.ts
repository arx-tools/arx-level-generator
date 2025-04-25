import type { ArrayBufferExports } from '@src/types.js'
import type { Platform as IPlatform } from '@platform/common/Platform.js'

export class Platform implements IPlatform {
  async downloadAsZip(buffers: ArrayBufferExports): Promise<void> {
    // TODO
  }
}
