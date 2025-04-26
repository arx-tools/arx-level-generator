import fs from 'node:fs/promises'
import path from 'node:path'
import type { ArrayBufferExports, FileExports } from '@src/types.js'
import type { Platform as IPlatform } from '@platform/common/Platform.js'
import { readBinaryFile, writeBinaryFile } from '@platform/node/io.js'

export class Platform implements IPlatform {
  async saveToDisk(buffers: ArrayBufferExports): Promise<void> {
    for (const target in buffers) {
      const data = buffers[target]

      const dirname = path.dirname(target)
      await fs.mkdir(dirname, { recursive: true })

      await writeBinaryFile(target, data)
    }
  }

  async removeFromDisk(pathsToFiles: string[]): Promise<void> {
    for (const file of pathsToFiles) {
      try {
        await fs.rm(file)
      } catch {}
    }
  }

  async readAllFromDisk(files: FileExports): Promise<ArrayBufferExports> {
    const buffers: ArrayBufferExports = {}

    for (const target in files) {
      const source = files[target]
      buffers[target] = await readBinaryFile(source)
    }

    return buffers
  }
}
