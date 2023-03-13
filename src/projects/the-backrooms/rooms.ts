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

let oldRoomSize = new Vector3(0, 0, 0)
let newRoomSize = new Vector3(0, 0, 0)
let cursor = new Vector3(0, 0, 0)

const saves: Record<string, CursorSave> = {}

export function moveCursor(...dirs: CursorDir[]) {
  dirs.forEach((dir) => {
    const axis = dir[0] as 'x' | 'y' | 'z'
    const alignment = dir.slice(1) as '--' | '-' | '' | '+' | '++'

    if (axis === 'y') {
      switch (alignment) {
        case '++':
          cursor.y -= newRoomSize.y * 2
          break
        case '+':
          cursor.y -= newRoomSize.y
          break
        case '':
          cursor.y -= newRoomSize.y / 2
          break
        case '-':
          cursor.y += 0
          break
        case '--':
          cursor.y += newRoomSize.y
          break
      }

      return
    }

    switch (alignment) {
      case '++':
        cursor[axis] += oldRoomSize[axis] / 2 + newRoomSize[axis] / 2
        break
      case '+':
        cursor[axis] += oldRoomSize[axis] / 2 - newRoomSize[axis] / 2
        break
      case '-':
        cursor[axis] -= oldRoomSize[axis] / 2 - newRoomSize[axis] / 2
        break
      case '--':
        cursor[axis] -= oldRoomSize[axis] / 2 + newRoomSize[axis] / 2
        break
    }
  })
}

let previousRoom: ArxMap | undefined = undefined
let currentRoom: ArxMap | undefined = undefined
const rooms: ArxMap[] = []

export function saveCursorAs(key: string) {
  const save: CursorSave = {
    cursor: cursor.clone(),
    oldRoomSize: oldRoomSize.clone(),
    newRoomSize: newRoomSize.clone(),
    previousRoomIdx: rooms.length - 1,
  }
  saves[key] = save
}

export function restoreCursor(key: string) {
  if (key in saves) {
    cursor = saves[key].cursor.clone()
    oldRoomSize = saves[key].oldRoomSize.clone()
    newRoomSize = saves[key].newRoomSize.clone()
    previousRoom = rooms[saves[key].previousRoomIdx]
  }
}

export async function addRoom(direction: Vector3, texture: Texture | Promise<Texture>, ...adjustments: CursorDir[]) {
  newRoomSize = direction
  if (!any(startsWith('y'), adjustments)) {
    adjustments.push('y-')
  }
  moveCursor(...adjustments)

  currentRoom = await createRoom(newRoomSize, texture)
  currentRoom.move(cursor)

  if (previousRoom !== undefined) {
    union(previousRoom, currentRoom)
  }
  rooms.push(currentRoom)

  previousRoom = currentRoom
  oldRoomSize = newRoomSize
}

// only works when everything is aligned in a 100/100/100 grid
export function union(map1: ArxMap, map2: ArxMap) {
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

export function getRooms() {
  return rooms
}
