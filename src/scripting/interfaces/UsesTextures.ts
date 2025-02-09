import { type Settings } from '@platform/common/Settings.js'
import { type FileExports } from '@src/types.js'

export interface UsesTextures {
  exportTextures(settings: Settings): Promise<FileExports>
}

export function isUsesTextures(obj: any): obj is UsesTextures {
  return (obj as UsesTextures).exportTextures !== undefined
}
