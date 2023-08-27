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
      variant?: string
      mode?: string
    }
  }
}

export {}
