import fs from 'node:fs/promises'
import path from 'node:path'
import type { ArrayBufferExports } from '@src/types.js'
import type { Platform as IPlatform } from '@platform/common/Platform.js'
import { writeBinaryFile } from '@platform/node/io.js'

export class Platform implements IPlatform {
  async saveToDisk(buffers: ArrayBufferExports): Promise<void> {
    for (const target in buffers) {
      const data = buffers[target]

      const dirname = path.dirname(target)
      await fs.mkdir(dirname, { recursive: true })

      await writeBinaryFile(target, data)
    }
  }
}
