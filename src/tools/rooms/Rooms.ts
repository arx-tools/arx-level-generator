import { ArxMap } from '@src/ArxMap.js'
import { none, startsWith } from '@src/faux-ramda.js'
import { removeByValue } from '@src/helpers.js'
import { Vector3 } from '@src/Vector3.js'
import { createRoom, RoomProps } from '@tools/rooms/room.js'
import { Cursor, CursorDir } from '@tools/rooms/Cursor.js'

// ---------------------------

// only works when everything is aligned to a 100/100/100 grid
function union(map1: ArxMap, map2: ArxMap) {
  // TODO: this removes both polygons when they overlap, which is ideal for walls
  // but not for ceilings and floors

  const map1BB = map1.getBoundingBox()
  const map2BB = map2.getBoundingBox()

  const toBeRemoved1 = map1.polygons.filter((p) => {
    if (p.isPartiallyWithin(map2BB)) {
      return true
    }
    const matchesAnotherPolygon = map2.polygons.find((q) => p.equals(q, Number.EPSILON * 10 ** 3)) !== undefined
    return matchesAnotherPolygon
  })

  const toBeRemoved2 = map2.polygons.filter((p) => {
    if (p.isPartiallyWithin(map1BB)) {
      return true
    }
    const matchesAnotherPolygon = map1.polygons.find((q) => p.equals(q, Number.EPSILON * 10 ** 3)) !== undefined
    return matchesAnotherPolygon
  })

  toBeRemoved1.forEach((p) => {
    removeByValue(p, map1.polygons)
  })

  toBeRemoved2.forEach((p) => {
    removeByValue(p, map2.polygons)
  })
}

export class Rooms {
  entries: ArxMap[] = []
  previousRoom: ArxMap | undefined = undefined
  currentRoom: ArxMap | undefined = undefined
  cursor: Cursor

  constructor(cursor: Cursor) {
    this.cursor = cursor
  }

  async addRoom(dimensions: Vector3, props: RoomProps, ...adjustments: CursorDir[]) {
    this.cursor.newSize = dimensions
    if (none(startsWith('y'), adjustments)) {
      adjustments.push('y-')
    }
    this.cursor.move(...adjustments)

    this.currentRoom = await createRoom(dimensions, props)
    this.currentRoom.move(this.cursor.cursor)

    // if (this.previousRoom !== undefined) {
    //   union(this.previousRoom, this.currentRoom)
    // }
    this.entries.push(this.currentRoom)

    this.previousRoom = this.currentRoom
    this.cursor.oldSize = this.cursor.newSize
  }

  unionAll() {
    if (this.entries.length < 2) {
      return
    }

    for (let i = 0; i < this.entries.length - 1; i++) {
      for (let j = i + 1; j < this.entries.length; j++) {
        union(this.entries[i], this.entries[j])
      }
    }
  }

  forEach(fn: (entry: ArxMap) => void) {
    this.entries.forEach(fn)
  }
}
