import { type Settings } from '@platform/common/Settings.js'
import { type FileExports } from '@src/types.js'

export interface IUsesTextures {
  exportTextures(settings: Settings): Promise<FileExports>
}

export function isUsesTextures(obj: any): obj is IUsesTextures {
  return (obj as IUsesTextures).exportTextures !== undefined
}
