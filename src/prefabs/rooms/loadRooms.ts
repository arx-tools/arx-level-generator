import fs from 'node:fs'
import { Texture } from '@src/Texture.js'
import { Vector3 } from '@src/Vector3.js'
import { Cursor, CursorDir } from '@prefabs/rooms/Cursor.js'
import { Rooms } from '@prefabs/rooms/Rooms.js'
import { RoomProps } from '@prefabs/rooms/room.js'
import { createLight } from '@tools/createLight.js'

export const loadRooms = async (filename: string) => {
  const cursor = new Cursor()
  const rooms = new Rooms(cursor)

  const roomDefinitions: Record<string, RoomProps> = {
    default: {
      textures: {
        ceiling: Texture.missingTexture,
        wall: Texture.missingTexture,
        floor: Texture.missingTexture,
      },
    },
  }
  const variables: Record<string, string> = {}

  const rawInput = await fs.promises.readFile(filename, 'utf-8')
  const lines = rawInput.split(/\r?\n/)

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    if (line.startsWith('#') || line === '') {
      continue
    }

    const tokens = line.split(' ')

    switch (tokens[0]) {
      case 'define':
        // TODO: validate arguments
        const definitionName = tokens[1]
        if (typeof roomDefinitions[definitionName] === 'undefined') {
          roomDefinitions[definitionName] = {
            textures: {
              ceiling: Texture.missingTexture,
              wall: Texture.missingTexture,
              floor: Texture.missingTexture,
            },
          }
        }
        switch (tokens[2]) {
          case 'floor':
          case 'wall':
          case 'ceiling':
            if (tokens[3] === 'custom') {
              roomDefinitions[definitionName].textures[tokens[2]] = await Texture.fromCustomFile({
                filename: tokens[3],
                sourcePath: tokens[4],
              })
            } else {
              roomDefinitions[definitionName].textures[tokens[2]] = new Texture({ filename: tokens[3], size: 128 })
            }
            break
          default:
          // TODO
        }
        break
      case 'room':
        switch (tokens[1]) {
          case 'add':
            // TODO: validate arguments
            const posX = parseInt(tokens[2].startsWith('$') ? variables[tokens[2]] : tokens[2])
            const posY = parseInt(tokens[3].startsWith('$') ? variables[tokens[3]] : tokens[3])
            const posZ = parseInt(tokens[4].startsWith('$') ? variables[tokens[4]] : tokens[4])
            const definitionName = tokens[5]

            await rooms.addRoom(
              new Vector3(posX, posY, posZ),
              roomDefinitions[definitionName],
              ...(tokens.slice(6) as CursorDir[]),
            )
            break
          default:
            console.error(`Unknown parameter "${tokens[1]}" after "room" at line ${i + 1}`)
        }
        break
      case 'with':
        switch (tokens[1]) {
          case 'light':
            if (rooms.currentRoom === undefined) {
              // TODO: error: only add light if there's at least 1 room
            } else {
              const mainLight = createLight({
                radius: Math.max(cursor.newSize.x, cursor.newSize.y, cursor.newSize.z),
                position: new Vector3(cursor.cursor.x, cursor.cursor.y - cursor.newSize.y / 2, cursor.cursor.z),
              })

              rooms.currentRoom.lights.push(mainLight)
            }
            break
          default:
            console.error(`Unknown parameter "${tokens[1]}" after "with" at line ${i + 1}`)
        }
        break
      case 'cursor':
        switch (tokens[1]) {
          case 'save':
            // TODO: check if tokens[2] exists
            cursor.saveAs(tokens[2])
            break
          case 'restore':
            // TODO: check if tokens[2] exists
            cursor.restore(tokens[2])
            break
          default:
            console.error(`Unknown parameter "${tokens[1]}" after "cursor" at line ${i + 1}`)
        }
        break
      default:
        if (tokens[0].startsWith('$')) {
          if (tokens[1] === '=') {
            if (typeof tokens[2] !== 'undefined') {
              variables[tokens[0]] = tokens[2]
            } else {
              console.error(`Missing value for variable at line ${i + 1}`)
            }
          } else {
            console.error(`Unexpected token "${tokens[1]}" after variable at line ${i + 1}`)
          }
        } else {
          console.error(`Unknown command "${tokens[0]}" at line ${i + 1}`)
        }
    }
  }

  rooms.unionAll()

  return rooms
}
