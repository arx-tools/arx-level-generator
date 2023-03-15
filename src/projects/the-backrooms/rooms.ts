import { ArxMap } from '@src/ArxMap'
import { any, startsWith } from '@src/faux-ramda'
import { removeByValue } from '@src/helpers'
import { Texture } from '@src/Texture'
import { Vector3 } from '@src/Vector3'
import { createRoom } from './room'

export type CursorSave = {
  oldRoomSize: Vector3
  newRoomSize: Vector3
  cursor: Vector3
  previousRoomIdx: number
}

export type CursorDir =
  | 'x--'
  | 'x-'
  | 'x'
  | 'x+'
  | 'x++'
  | 'y--'
  | 'y-'
  | 'y'
  | 'y+'
  | 'y++'
  | 'z--'
  | 'z-'
  | 'z'
  | 'z+'
  | 'z++'

// ---------------------------

// only works when everything is aligned in a 100/100/100 grid
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
  rooms: ArxMap[] = []
  previousRoom: ArxMap | undefined = undefined
  currentRoom: ArxMap | undefined = undefined

  oldRoomSize = new Vector3(0, 0, 0)
  newRoomSize = new Vector3(0, 0, 0)
  cursor = new Vector3(0, 0, 0)

  saves: Record<string, CursorSave> = {}

  moveCursor(...dirs: CursorDir[]) {
    dirs.forEach((dir) => {
      const axis = dir[0] as 'x' | 'y' | 'z'
      const alignment = dir.slice(1) as '--' | '-' | '' | '+' | '++'

      if (axis === 'y') {
        switch (alignment) {
          case '++':
            // next floor = prev ceiling
            this.cursor.y -= this.oldRoomSize.y
            break
          case '+':
            // next ceiling = prev ceiling
            this.cursor.y -= this.oldRoomSize.y - this.newRoomSize.y
            break
          case '':
            // next middle = prev middle
            this.cursor.y -= this.oldRoomSize.y / 2 - this.newRoomSize.y / 2
            break
          case '-':
            // next floor = prev floor
            this.cursor.y += 0
            break
          case '--':
            // next ceiling = prev floor
            this.cursor.y += this.newRoomSize.y
            break
        }

        return
      }

      switch (alignment) {
        case '++':
          this.cursor[axis] += this.oldRoomSize[axis] / 2 + this.newRoomSize[axis] / 2
          break
        case '+':
          this.cursor[axis] += this.oldRoomSize[axis] / 2 - this.newRoomSize[axis] / 2
          break
        case '-':
          this.cursor[axis] -= this.oldRoomSize[axis] / 2 - this.newRoomSize[axis] / 2
          break
        case '--':
          this.cursor[axis] -= this.oldRoomSize[axis] / 2 + this.newRoomSize[axis] / 2
          break
      }
    })
  }

  forEach(fn: (room: ArxMap) => void) {
    this.rooms.forEach(fn)
  }

  saveCursorAs(key: string) {
    const save: CursorSave = {
      cursor: this.cursor.clone(),
      oldRoomSize: this.oldRoomSize.clone(),
      newRoomSize: this.newRoomSize.clone(),
      previousRoomIdx: this.rooms.length - 1,
    }
    this.saves[key] = save
  }

  restoreCursor(key: string) {
    if (key in this.saves) {
      this.cursor = this.saves[key].cursor.clone()
      this.oldRoomSize = this.saves[key].oldRoomSize.clone()
      this.newRoomSize = this.saves[key].newRoomSize.clone()
      this.previousRoom = this.rooms[this.saves[key].previousRoomIdx]
    }
  }

  async addRoom(direction: Vector3, texture: Texture | Promise<Texture>, ...adjustments: CursorDir[]) {
    this.newRoomSize = direction
    // if no y alignment is specified then we assume the rooms are level
    // meaning the floor is at the same y coordinate (y-)
    if (!any(startsWith('y'), adjustments)) {
      adjustments.push('y-')
    }
    this.moveCursor(...adjustments)

    this.currentRoom = await createRoom(this.newRoomSize, texture)
    this.currentRoom.move(this.cursor)

    if (this.previousRoom !== undefined) {
      union(this.previousRoom, this.currentRoom)
    }
    this.rooms.push(this.currentRoom)

    this.previousRoom = this.currentRoom
    this.oldRoomSize = this.newRoomSize
  }
}
