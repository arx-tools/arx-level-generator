export class MapFinalizedError extends Error {
  constructor() {
    super('Attempting to change mapdata which have already been finalized')
    this.name = 'MapFinalizedError'
  }
}

export class MapNotFinalizedError extends Error {
  constructor() {
    super('Attempting to export mapdata which not yet have been finalized')
    this.name = 'MapNotFinalizedError'
  }
}
