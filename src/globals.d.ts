declare global {
  namespace NodeJS {
    interface ProcessEnv {
      OUTPUTDIR?: string
      LEVEL?: number
    }
  }
}

export {}
