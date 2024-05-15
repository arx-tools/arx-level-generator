import { Path } from '@src/Path.js'

export class Paths extends Array<Path> {
  toArxData() {
    const arxPaths = this.map((path) => {
      return path.toArxPath()
    })

    return {
      paths: arxPaths,
    }
  }

  empty() {
    this.length = 0
  }
}
