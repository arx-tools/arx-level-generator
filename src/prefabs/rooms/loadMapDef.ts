import fs from 'node:fs'
import { Texture } from '@src/Texture.js'
import { Vector3 } from '@src/Vector3.js'
import { randomBetween } from '@src/random.js'
import { Cursor, CursorDir } from '@prefabs/rooms/Cursor.js'
import { Rooms } from '@prefabs/rooms/Rooms.js'
import { RoomProps } from '@prefabs/rooms/room.js'
import { createLight } from '@tools/createLight.js'

export const loadMapDef = async (filename: string) => {
  const cursor = new Cursor()
  const rooms = new Rooms(cursor)
  const roomDefinitions: Record<string, RoomProps> = {}

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
            roomDefinitions[definitionName].textures[tokens[2]] = new Texture({ filename: tokens[3], size: 128 })
            break
          default:
          // TODO
        }
        break
      case 'room':
        switch (tokens[1]) {
          case 'add':
            // TODO: validate arguments
            await rooms.addRoom(
              new Vector3(parseInt(tokens[2]), parseInt(tokens[3]), parseInt(tokens[4])),
              roomDefinitions[tokens[5]],
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
              const lightSpacing = 200
              const xAmount = Math.floor(cursor.newSize.x / lightSpacing)
              const yAmount = Math.floor(cursor.newSize.y / lightSpacing)
              const zAmount = Math.floor(cursor.newSize.z / lightSpacing)
              for (let x = 0; x < xAmount; x++) {
                for (let y = 0; y < yAmount; y++) {
                  for (let z = 0; z < zAmount; z++) {
                    const light = createLight({
                      radius: lightSpacing * 1.3,
                      position: new Vector3(
                        cursor.cursor.x -
                          cursor.newSize.x / 2 +
                          x * lightSpacing +
                          lightSpacing / 2 +
                          randomBetween(-lightSpacing / 2, +lightSpacing / 2),
                        cursor.cursor.y -
                          y * lightSpacing -
                          lightSpacing / 2 -
                          randomBetween(-lightSpacing / 2, +lightSpacing / 2),
                        cursor.cursor.z -
                          cursor.newSize.z / 2 +
                          z * lightSpacing +
                          lightSpacing / 2 +
                          randomBetween(-lightSpacing / 2, +lightSpacing / 2),
                      ),
                    })
                    rooms.currentRoom.lights.push(light)
                  }
                }
              }
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
        console.error(`Unknown command "${tokens[0]}" at line ${i + 1}`)
    }
  }

  rooms.unionAll()

  return rooms
}
