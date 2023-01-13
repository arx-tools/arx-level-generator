import path from 'node:path'
import seedrandom from 'seedrandom'
import { ArxMap } from '@src/ArxMap'
import { Color } from '@src/Color'
import { Vector3 } from '@src/Vector3'
import { Light } from '@src/Light'
import { createRoom } from './room'
import { ArxPolygonFlags } from 'arx-convert/types'
import { removeByValue } from '@src/helpers'
import { wallpaper, wallpaperDotted } from './materials'
import { Texture } from '@src/Texture'

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

export default async () => {
  const {
    OUTPUTDIR = path.resolve(__dirname, './dist'),
    LEVEL = '1',
    SEED = Math.floor(Math.random() * 1e20).toString(),
  } = process.env

  seedrandom(SEED, { global: true })
  console.log(`seed: ${SEED}`)

  // ---------------

  type CursorSave = { oldRoomSize: Vector3; newRoomSize: Vector3; cursor: Vector3; previousRoomIdx: number }
  type CursorDir =
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

  let oldRoomSize = new Vector3(0, 0, 0)
  let newRoomSize = new Vector3(0, 0, 0)
  let cursor = new Vector3(0, 0, 0)

  const saves: Record<string, CursorSave> = {}

  function moveCursor(...dirs: CursorDir[]) {
    dirs.forEach((dir) => {
      const axis = dir[0] as 'x' | 'y' | 'z'
      const alignment = dir.slice(1) as '--' | '-' | '' | '+' | '++'

      if (axis === 'y') {
        // TODO: flip direction
        // TODO: the center on this axis is on the bottom and not in the middle
        // like as in with the x and z axis
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

  function saveCursorAs(key: string) {
    const save: CursorSave = {
      cursor: cursor.clone(),
      oldRoomSize: oldRoomSize.clone(),
      newRoomSize: newRoomSize.clone(),
      previousRoomIdx: rooms.length - 1,
    }
    saves[key] = save
  }

  function restoreCursor(key: string) {
    if (key in saves) {
      cursor = saves[key].cursor.clone()
      oldRoomSize = saves[key].oldRoomSize.clone()
      newRoomSize = saves[key].newRoomSize.clone()
      previousRoom = rooms[saves[key].previousRoomIdx]
    }
  }

  async function addRoom(dimensions: Vector3, texture: Texture | Promise<Texture>, ...adjustments: CursorDir[]) {
    newRoomSize = dimensions
    moveCursor(...adjustments)

    currentRoom = await createRoom(newRoomSize, wallpaperDotted)
    currentRoom.move(cursor)

    if (previousRoom !== undefined) {
      union(previousRoom, currentRoom)
    }
    rooms.push(currentRoom)

    previousRoom = currentRoom
    oldRoomSize = newRoomSize
  }

  // -----------

  await addRoom(new Vector3(800, 500, 1000), wallpaper)
  saveCursorAs('spawn')
  await addRoom(new Vector3(200, 300, 400), wallpaperDotted, 'z++')
  await addRoom(new Vector3(600, 400, 600), wallpaper, 'z++')
  saveCursorAs('branch point')
  await addRoom(new Vector3(1000, 300, 200), wallpaperDotted, 'x--')
  await addRoom(new Vector3(400, 400, 400), wallpaper, 'x--')
  await addRoom(new Vector3(200, 1000, 200), wallpaper, 'x++', 'y-', 'z--')
  restoreCursor('branch point')
  await addRoom(new Vector3(1000, 300, 200), wallpaperDotted, 'x++')
  await addRoom(new Vector3(400, 400, 400), wallpaper, 'x++')

  const map = new ArxMap()

  map.config.offset = new Vector3(6000, 0, 6000)
  map.player.position.adjustToPlayerHeight()
  map.hideMinimap()

  rooms.forEach((room) => {
    map.add(room, true)
  })

  // ---------------

  // const light = new Light({
  //   color: Color.yellow.lighten(50),
  //   position: new Vector3(0, -800, 0),
  //   fallStart: 100,
  //   fallEnd: 1000,
  //   intensity: 2,
  //   lightData: {
  //     exFlicker: Color.transparent,
  //     exRadius: 0,
  //     exFrequency: 0,
  //     exSize: 0,
  //     exSpeed: 0,
  //     exFlareSize: 0,
  //   },
  // })

  // map.lights.push(light)

  map.finalize()

  map.saveToDisk(OUTPUTDIR, parseInt(LEVEL))
}
