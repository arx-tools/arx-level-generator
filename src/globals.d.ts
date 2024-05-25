declare global {
  namespace NodeJS {
    interface ProcessEnv {
      originalLevelFiles?: string
      cacheFolder?: string
      outputDir?: string
      levelIdx?: string
      assetsDir?: string
      calculateLighting?: string
      lightingCalculatorMode?: string
      seed?: string
      mode?: string
      uncompressedFTS?: string
    }
  }
}

export {}
