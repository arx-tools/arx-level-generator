import type { TextureExportData } from '@src/Texture.js'

export interface UsesTextures {
  exportTextures(): TextureExportData[]
}

export function isUsesTextures(obj: any): obj is UsesTextures {
  return (obj as UsesTextures).exportTextures !== undefined
}
