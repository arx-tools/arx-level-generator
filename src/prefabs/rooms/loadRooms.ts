import fs from 'node:fs'
import path from 'node:path'
import { QuadrupleOf } from 'arx-convert/utils'
import { Settings } from '@src/Settings.js'
import { Texture } from '@src/Texture.js'
import { Vector3 } from '@src/Vector3.js'
import { TextureOrMaterial } from '@src/types.js'
import { Cursor, CursorDir } from '@prefabs/rooms/Cursor.js'
import { Rooms } from '@prefabs/rooms/Rooms.js'
import { RoomProps, TextureDefinition } from '@prefabs/rooms/room.js'
import { createLight } from '@tools/createLight.js'

export const loadRooms = async (filename: string, settings: Settings) => {
  const cursor = new Cursor()
  const rooms = new Rooms(cursor)

  const roomDefinitions: Record<string, RoomProps> = {
    default: {
      textures: {
        ceiling: { texture: Texture.missingTexture, fitX: false, fitY: false },
        wall: { texture: Texture.missingTexture, fitX: false, fitY: false },
        floor: { texture: Texture.missingTexture, fitX: false, fitY: false },
      },
    },
  }
  const variables: Record<string, string> = {}

  const rawInput = await fs.promises.readFile(path.resolve(settings.assetsDir, filename), 'utf-8')
  const lines = rawInput.split(/\r?\n/)

  let currentBlock:
    | {
        type: 'define'
        name: string
      }
    | undefined = undefined

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].replace(/#.*$/, '').trim()

    if (line === '') {
      continue
    }

    const tokens = line.split(' ')

    if (currentBlock !== undefined) {
      switch (currentBlock.type) {
        case 'define':
          switch (tokens[0]) {
            case '}':
              currentBlock = undefined
              break
            case 'floor':
            case 'ceiling':
              {
                if (tokens[1] === 'custom') {
                  roomDefinitions[currentBlock.name].textures[tokens[0]].texture = Texture.fromCustomFile({
                    filename: tokens[3],
                    sourcePath: tokens[2],
                  })
                } else if (tokens[1] === 'arx') {
                  // TODO: an arx texture might not always be 128x128
                  roomDefinitions[currentBlock.name].textures[tokens[0]].texture = new Texture({
                    filename: tokens[2],
                    size: 128,
                  })
                } else {
                  console.error(
                    `Unknown texture type "${tokens[1]}" at line ${i + 1}, expected either "custom" or "arx"`,
                  )
                }
              }
              break
            case 'wall':
              {
                const wall = roomDefinitions[currentBlock.name].textures.wall as QuadrupleOf<TextureDefinition>

                if (tokens[1] === 'custom') {
                  const texture = Texture.fromCustomFile({ filename: tokens[3], sourcePath: tokens[2] })
                  const fitX = tokens[4] === 'fit-x'
                  const fitY = tokens[4] === 'fit-y'

                  wall[0] = { texture, fitX, fitY }
                  wall[1] = { texture, fitX, fitY }
                  wall[2] = { texture, fitX, fitY }
                  wall[3] = { texture, fitX, fitY }
                } else if (tokens[1] === 'arx') {
                  // TODO: an arx texture might not always be 128x128
                  const textureSize = 128

                  const texture = new Texture({ filename: tokens[2], size: textureSize })
                  const fitX = tokens[3] === 'fit-x'
                  const fitY = tokens[3] === 'fit-y'

                  wall[0] = { texture, fitX, fitY }
                  wall[1] = { texture, fitX, fitY }
                  wall[2] = { texture, fitX, fitY }
                  wall[3] = { texture, fitX, fitY }
                } else {
                  console.error(
                    `Unknown texture type "${tokens[1]}" at line ${i + 1}, expected either "custom" or "arx"`,
                  )
                }
              }
              break
            case 'wall-north':
            case 'wall-east':
            case 'wall-south':
            case 'wall-west':
              {
                const wallIdx = tokens[0].endsWith('north')
                  ? 0
                  : tokens[0].endsWith('east')
                  ? 1
                  : tokens[0].endsWith('south')
                  ? 2
                  : 3

                const wall = roomDefinitions[currentBlock.name].textures.wall as QuadrupleOf<TextureDefinition>
                if (tokens[1] === 'custom') {
                  const texture = Texture.fromCustomFile({ filename: tokens[3], sourcePath: tokens[2] })
                  const fitX = tokens[4] === 'fit-x'
                  const fitY = tokens[4] === 'fit-y'

                  wall[wallIdx] = { texture, fitX, fitY }
                } else if (tokens[1] === 'arx') {
                  // TODO: an arx texture might not always be 128x128
                  const textureSize = 128

                  const texture = new Texture({ filename: tokens[2], size: textureSize })
                  const fitX = tokens[3] === 'fit-x'
                  const fitY = tokens[3] === 'fit-y'

                  wall[wallIdx] = { texture, fitX, fitY }
                } else {
                  console.error(
                    `Unknown texture type "${tokens[1]}" at line ${i + 1}, expected either "custom" or "arx"`,
                  )
                }
              }
              break
            default:
              console.error(
                `Unknown side "${tokens[0]}" at line ${
                  i + 1
                }, expected "floor", "ceiling", "wall", "wall-east", "wall-west", "wall-north" or "wall-south"`,
              )
          }
      }
    } else {
      switch (tokens[0]) {
        case 'define':
          if (typeof tokens[1] === undefined) {
            console.error(`missing define block's name at line ${i + 1}`)
          } else {
            if (tokens[2] !== '{') {
              console.error(`missing { at line ${i + 1}`)
            } else {
              currentBlock = {
                type: 'define',
                name: tokens[1],
              }
              if (typeof roomDefinitions[tokens[1]] === 'undefined') {
                roomDefinitions[tokens[1]] = {
                  textures: {
                    ceiling: { texture: Texture.missingTexture, fitX: false, fitY: false },
                    wall: [
                      { texture: Texture.missingTexture, fitX: false, fitY: false },
                      { texture: Texture.missingTexture, fitX: false, fitY: false },
                      { texture: Texture.missingTexture, fitX: false, fitY: false },
                      { texture: Texture.missingTexture, fitX: false, fitY: false },
                    ],
                    floor: { texture: Texture.missingTexture, fitX: false, fitY: false },
                  },
                }
              }
            }
          }
          break
        case 'room':
          switch (tokens[1]) {
            case 'add':
              // TODO: validate arguments
              const posX = parseInt(tokens[2].startsWith('$') ? variables[tokens[2]] : tokens[2])
              const posY = parseInt(tokens[3].startsWith('$') ? variables[tokens[3]] : tokens[3])
              const posZ = parseInt(tokens[4].startsWith('$') ? variables[tokens[4]] : tokens[4])
              let definitionName = tokens[5]
              if (typeof roomDefinitions[definitionName] === 'undefined') {
                console.error(`Unknown texture definition "${tokens[5]}" at line ${i + 1}`)
                definitionName = 'default'
              }
              const adjustments = tokens.slice(6) as CursorDir[]

              rooms.addRoom(new Vector3(posX, posY, posZ), roomDefinitions[definitionName], ...adjustments)
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
  }

  rooms.unionAll()

  return rooms
}
