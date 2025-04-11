export class MapFinalizedError extends Error {
  constructor() {
    super('Attempting to change mapdata which have already been finalized.')
    this.name = 'MapFinalizedError'
  }
}

export class MapNotFinalizedError extends Error {
  constructor() {
    super('Attempting to export mapdata which not yet have been finalized.')
    this.name = 'MapNotFinalizedError'
  }
}

export class ExportBuiltinAssetError extends Error {
  constructor() {
    super('Attempting to export an asset that is built into the base game.')
    this.name = 'ExportNativeAssetError'
  }
}

export class SyntaxError extends Error {
  constructor(lineNumber: number, charNumber: number) {
    super(`Syntax error at ${lineNumber}:${charNumber}`)
    this.name = 'SyntaxError'
  }
}
