import { Zone } from '@src/Zone.js'
import { Cursor } from '@prefabs/rooms/Cursor.js'

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
