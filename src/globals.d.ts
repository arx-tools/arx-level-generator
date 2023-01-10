declare global {
  namespace NodeJS {
    interface ProcessEnv {
      OUTPUTDIR?: string
      PROJECT: string
      LEVEL?: string
      SEED?: string
    }
  }
}

export {}
