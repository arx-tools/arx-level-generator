import { Settings } from '@src/Settings.js'

export interface UsesTextures {
  exportTextures(outputDir: string, settings: Settings): Promise<Record<string, string>>
}

export const isUsesTextures = (obj: any): obj is UsesTextures => {
  return (obj as UsesTextures).exportTextures !== undefined
}
