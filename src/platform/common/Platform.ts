import type { ArxMap } from '@src/ArxMap.js'
import type { TextureExportData } from '@src/Texture.js'
import type { ArrayBufferExports, FileExports } from '@src/types.js'
import type { Settings } from '@platform/common/Settings.js'

export type IODiff = {
  toAdd: ArrayBufferExports
  toCopy: FileExports
  toRemove: string[]
  toExport: TextureExportData[]
}

export interface Platform {
  from(map: ArxMap | ArxMap[]): this
  save(settings: Settings, exportJsonFiles: boolean, prettify: boolean): Promise<void>
}
