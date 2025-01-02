import { type ISettings } from '@platform/common/ISettings.js'
import { type FileExports } from '@src/types.js'

export interface IUsesTextures {
  exportTextures(settings: ISettings): Promise<FileExports>
}

export function isUsesTextures(obj: any): obj is IUsesTextures {
  return (obj as IUsesTextures).exportTextures !== undefined
}
