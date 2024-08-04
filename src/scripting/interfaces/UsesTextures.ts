import { type Settings } from '@src/Settings.js'

export interface UsesTextures {
  exportTextures(settings: Settings): Promise<Record<string, string>>
}

export function isUsesTextures(obj: any): obj is UsesTextures {
  return (obj as UsesTextures).exportTextures !== undefined
}
