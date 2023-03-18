import { Zone } from '@src/Zone'
import { Cursor } from './Cursor'

export class Zones {
  entries: Zone[] = []
  cursor: Cursor

  constructor(cursor: Cursor) {
    this.cursor = cursor
  }

  forEach(fn: (entry: Zone) => void) {
    this.entries.forEach(fn)
  }
}
