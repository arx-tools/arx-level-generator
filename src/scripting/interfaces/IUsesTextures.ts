import { type ISettings } from '@platform/common/ISettings.js'

export interface IUsesTextures {
  exportTextures(settings: ISettings): Promise<Record<string, string>>
}

export function isUsesTextures(obj: any): obj is IUsesTextures {
  return (obj as IUsesTextures).exportTextures !== undefined
}
