declare global {
  namespace NodeJS {
    interface ProcessEnv {
      originalLevelFiles?: string
      cacheDir?: string
      outputDir?: string
      assetsDir?: string
      levelIdx?: string
      calculateLighting?: string
      lightingCalculatorMode?: string
      seed?: string
      mode?: string
      uncompressedFTS?: string
    }
  }
}

export {}
