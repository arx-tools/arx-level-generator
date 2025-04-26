import type { ArrayBufferExports, FileExports } from '@src/types.js'

export type IODiff = {
  toAdd: ArrayBufferExports
  toCopy: FileExports
  toRemove: string[]
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface -- the API is not yet clear to me
export interface Platform {
  // TODO
}
