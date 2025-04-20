import { type ArxPath } from 'arx-convert/types'
import { type Path } from '@src/Path.js'

export class Paths extends Array<Path> {
  toArxData(): { paths: ArxPath[] } {
    const arxPaths = this.map((path) => {
      return path.toArxPath()
    })

    return {
      paths: arxPaths,
    }
  }

  empty(): void {
    this.length = 0
  }
}
