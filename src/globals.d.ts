declare global {
  namespace NodeJS {
    interface ProcessEnv {
      OUTPUTDIR?: string
      LEVEL?: string
      SEED?: string
    }
  }
}

export {}
