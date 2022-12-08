declare global {
  namespace NodeJS {
    interface ProcessEnv {
      OUTPUTDIR?: string
      LEVEL?: string
    }
  }
}

export {}
