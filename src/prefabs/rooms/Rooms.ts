import { ArxMap } from '@src/ArxMap.js'
import { DONT_QUADIFY, QUADIFY } from '@src/Polygons.js'
import { $ } from '@src/Selection.js'
import { Vector3 } from '@src/Vector3.js'
import { Cursor, CursorDir } from '@prefabs/rooms/Cursor.js'
import { createRoom, RoomProps } from '@prefabs/rooms/room.js'

// ---------------------------

// only works when everything is aligned to the same grid with the same tileSize
function union(map1: ArxMap, map2: ArxMap) {
  // TODO: this removes both polygons when they overlap, which is ideal for walls
  // but not for ceilings and floors

  const map1BB = map1.polygons.getBoundingBox()
  const map2BB = map2.polygons.getBoundingBox()

  if (!map1BB.intersectsBox(map2BB)) {
    return
  }

  // we need to compare maps from both directions before
  // actually deleting anything!

  $(map1.polygons)
    .clearSelection()
    .selectBy((p) => {
      // TODO: we don't touch partially overlapping polygons yet
      if (p.isPartiallyWithin(map2BB)) {
        return false
      }

      return map2.polygons.some((q) => p.equals(q, Number.EPSILON * 10 ** 3))
    })

  $(map2.polygons)
    .clearSelection()
    .selectBy((p) => {
      // TODO: we don't touch partially overlapping polygons yet
      if (p.isPartiallyWithin(map1BB)) {
        return false
      }

      return map1.polygons.some((q) => p.equals(q, Number.EPSILON * 10 ** 3))
    })

  $(map1.polygons).delete()
  $(map2.polygons).delete()
}

export class Rooms {
  maps: ArxMap[] = []
  previousRoom: ArxMap | undefined = undefined
  currentRoom: ArxMap | undefined = undefined
  cursor: Cursor

  constructor(cursor: Cursor) {
    this.cursor = cursor
  }

  addRoom(
    dimensions: Vector3,
    props: RoomProps,
    adjustments: CursorDir[],
    tryToQuadify?: typeof QUADIFY | typeof DONT_QUADIFY,
  ) {
    this.cursor.newSize = dimensions
    this.cursor.move(...adjustments)

    this.currentRoom = createRoom(dimensions, props, tryToQuadify)
    this.currentRoom.move(this.cursor.cursor)
    this.maps.push(this.currentRoom)

    this.previousRoom = this.currentRoom
    this.cursor.oldSize = this.cursor.newSize
  }

  unionAll() {
    if (this.maps.length <= 1) {
      return
    }

    for (let i = 0; i < this.maps.length - 1; i++) {
      for (let j = i + 1; j < this.maps.length; j++) {
        union(this.maps[i], this.maps[j])
      }
    }
  }

  forEach(fn: (map: ArxMap) => void) {
    this.maps.forEach(fn)
  }
}
