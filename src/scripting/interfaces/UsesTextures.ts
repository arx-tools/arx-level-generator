export interface UsesTextures {
  exportTextures(outputDir: string): Promise<Record<string, string>>
}

export const isUsesTextures = (obj: any): obj is UsesTextures => {
  return (obj as UsesTextures).exportTextures !== undefined
}
