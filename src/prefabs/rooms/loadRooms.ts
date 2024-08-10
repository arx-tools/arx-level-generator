import fs from 'node:fs/promises'
import path from 'node:path'
import { type QuadrupleOf } from 'arx-convert/utils'
import { type Settings } from '@src/Settings.js'
import { Texture } from '@src/Texture.js'
import { Vector3 } from '@src/Vector3.js'
import { Cursor, type CursorDir } from '@prefabs/rooms/Cursor.js'
import { Rooms } from '@prefabs/rooms/Rooms.js'
import { type RoomProps, type TextureDefinition } from '@prefabs/rooms/room.js'
import { createLight } from '@tools/createLight.js'

type CurrentBlock = {
  type: 'define'
  name: string
}

function parseCursorKeyword(tokens: string[], cursor: Cursor, lineNumber: number): void {
  switch (tokens[1]) {
    case 'save': {
      // TODO: check if tokens[2] exists
      cursor.saveAs(tokens[2])
      break
    }

    case 'restore': {
      // TODO: check if tokens[2] exists
      cursor.restore(tokens[2])
      break
    }

    default: {
      console.error(`[error] loadRooms: Unknown parameter "${tokens[1]}" after "cursor" at line ${lineNumber}`)
    }
  }
}

function parseWithKeyword(tokens: string[], cursor: Cursor, rooms: Rooms, lineNumber: number): void {
  switch (tokens[1]) {
    case 'light': {
      if (rooms.currentRoom === undefined) {
        // TODO: error: only add light if there's at least 1 room
      } else {
        const mainLight = createLight({
          radius: Math.max(cursor.newSize.x, cursor.newSize.y, cursor.newSize.z),
          position: new Vector3(cursor.cursor.x, cursor.cursor.y - cursor.newSize.y / 2, cursor.cursor.z),
        })

        if (tokens[2] !== undefined) {
          const brightness = tokens[2].trim()
          if (brightness === 'dim') {
            mainLight.intensity = 0.5
          } else if (/\d+%/.test(brightness)) {
            mainLight.intensity = Number.parseInt(brightness, 10) / 100
          } else {
            console.warn(
              `[warn] loadRooms: Ignoring unknown brightness "${tokens[2]}" after "with light" at line ${lineNumber}`,
            )
          }
        }

        rooms.currentRoom.lights.push(mainLight)
      }

      break
    }

    default: {
      console.error(`[error] loadRooms: Unknown parameter "${tokens[1]}" after "with" at line ${lineNumber}`)
    }
  }
}

function parseRoomKeyword(
  tokens: string[],
  rooms: Rooms,
  variables: Record<string, string>,
  roomDefinitions: Record<string, RoomProps>,
  lineNumber: number,
): void {
  switch (tokens[1]) {
    case 'add': {
      {
        // TODO: validate arguments
        const posX = Number.parseInt(tokens[2].startsWith('$') ? variables[tokens[2]] : tokens[2], 10)
        const posY = Number.parseInt(tokens[3].startsWith('$') ? variables[tokens[3]] : tokens[3], 10)
        const posZ = Number.parseInt(tokens[4].startsWith('$') ? variables[tokens[4]] : tokens[4], 10)
        let definitionName = tokens[5]
        if (roomDefinitions[definitionName] === undefined) {
          console.error(`[error] loadRooms: Unknown texture definition "${tokens[5]}" at line ${lineNumber}`)
          definitionName = 'default'
        }

        const adjustments = tokens.slice(6) as CursorDir[]

        // TODO: read this from the definition file somehow
        // for now it is being quadified as per the MeshImportProps.tryToQuadify's default value in Polygons.ts
        const tryToQuadify = undefined

        rooms.addRoom(new Vector3(posX, posY, posZ), roomDefinitions[definitionName], adjustments, tryToQuadify)
      }

      break
    }

    default: {
      console.error(`[error] loadRooms: Unknown parameter "${tokens[1]}" after "room" at line ${lineNumber}`)
    }
  }
}

function parseVariable(tokens: string[], variables: Record<string, string>, lineNumber: number): void {
  if (tokens[1] === '=') {
    if (tokens[2] === undefined) {
      console.error(`[error] loadRooms: Missing value for variable at line ${lineNumber}`)
    } else {
      variables[tokens[0]] = tokens[2]
    }
  } else {
    console.error(`[error] loadRooms: Unexpected token "${tokens[1]}" after variable at line ${lineNumber}`)
  }
}

export async function loadRooms(filename: string, settings: Settings): Promise<Rooms> {
  const cursor = new Cursor()
  const rooms = new Rooms(cursor)

  const roomDefinitions: Record<string, RoomProps> = {
    default: {
      textures: {
        ceiling: { texture: Texture.missingTexture, fitX: false, fitY: false, isRemoved: false },
        wall: { texture: Texture.missingTexture, fitX: false, fitY: false, isRemoved: false },
        floor: { texture: Texture.missingTexture, fitX: false, fitY: false, isRemoved: false },
      },
    },
  }

  const variables: Record<string, string> = {}

  const rawInput = await fs.readFile(path.resolve(settings.assetsDir, filename), 'utf8')
  const lines = rawInput.split(/\r?\n/)

  let currentBlock: CurrentBlock | undefined = undefined

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].replace(/#.*$/, '').trim()

    if (line === '') {
      continue
    }

    const tokens = line.split(' ')

    if (currentBlock === undefined) {
      switch (tokens[0]) {
        case 'define': {
          if (tokens[1] === undefined) {
            console.error(`[error] loadRooms: missing define block's name at line ${i + 1}`)
          } else {
            if (tokens[2] === '{') {
              currentBlock = { type: 'define', name: tokens[1] }

              if (roomDefinitions[tokens[1]] === undefined) {
                roomDefinitions[tokens[1]] = {
                  textures: {
                    ceiling: { texture: Texture.missingTexture, fitX: false, fitY: false, isRemoved: false },
                    wall: [
                      { texture: Texture.missingTexture, fitX: false, fitY: false, isRemoved: false },
                      { texture: Texture.missingTexture, fitX: false, fitY: false, isRemoved: false },
                      { texture: Texture.missingTexture, fitX: false, fitY: false, isRemoved: false },
                      { texture: Texture.missingTexture, fitX: false, fitY: false, isRemoved: false },
                    ],
                    floor: { texture: Texture.missingTexture, fitX: false, fitY: false, isRemoved: false },
                  },
                }
              }
            } else {
              console.error(`[error] loadRooms: missing { at line ${i + 1}`)
            }
          }

          break
        }

        case 'room': {
          parseRoomKeyword(tokens, rooms, variables, roomDefinitions, i + 1)
          break
        }

        case 'with': {
          parseWithKeyword(tokens, cursor, rooms, i + 1)
          break
        }

        case 'cursor': {
          parseCursorKeyword(tokens, cursor, i + 1)
          break
        }

        default: {
          if (tokens[0].startsWith('$')) {
            parseVariable(tokens, variables, i + 1)
          } else {
            console.error(`[error] loadRooms: Unknown command "${tokens[0]}" at line ${i + 1}`)
          }
        }
      }
    } else {
      switch (currentBlock.type) {
        case 'define': {
          switch (tokens[0]) {
            case '}': {
              currentBlock = undefined
              break
            }

            case 'floor':
            case 'ceiling': {
              switch (tokens[1]) {
                case 'custom': {
                  const texture = Texture.fromCustomFile({ filename: tokens[3], sourcePath: tokens[2] })
                  const fitX = tokens[4] === 'fit-x' || tokens[4] === 'stretch'
                  const fitY = tokens[4] === 'fit-y' || tokens[4] === 'stretch'

                  roomDefinitions[currentBlock.name].textures[tokens[0]] = { texture, fitX, fitY, isRemoved: false }
                  break
                }

                case 'arx': {
                  // TODO: an arx texture might not always be 128x128
                  const textureSize = 128

                  const texture = new Texture({ filename: tokens[2], size: textureSize })
                  const fitX = tokens[3] === 'fit-x' || tokens[3] === 'stretch'
                  const fitY = tokens[3] === 'fit-y' || tokens[3] === 'stretch'

                  roomDefinitions[currentBlock.name].textures[tokens[0]] = { texture, fitX, fitY, isRemoved: false }
                  break
                }

                case 'off': {
                  roomDefinitions[currentBlock.name].textures[tokens[0]].isRemoved = true
                  break
                }

                default: {
                  console.error(
                    `[error] loadRooms: Unknown texture type "${tokens[1]}" at line ${
                      i + 1
                    }, expected either "custom", "arx" or "off"`,
                  )
                }
              }

              break
            }

            case 'wall': {
              const wall = roomDefinitions[currentBlock.name].textures.wall as QuadrupleOf<TextureDefinition>

              switch (tokens[1]) {
                case 'custom': {
                  const texture = Texture.fromCustomFile({ filename: tokens[3], sourcePath: tokens[2] })
                  const fitX = tokens[4] === 'fit-x' || tokens[4] === 'stretch'
                  const fitY = tokens[4] === 'fit-y' || tokens[4] === 'stretch'

                  wall[0] = { texture, fitX, fitY, isRemoved: false }
                  wall[1] = { texture, fitX, fitY, isRemoved: false }
                  wall[2] = { texture, fitX, fitY, isRemoved: false }
                  wall[3] = { texture, fitX, fitY, isRemoved: false }
                  break
                }

                case 'arx': {
                  // TODO: an arx texture might not always be 128x128
                  const textureSize = 128

                  const texture = new Texture({ filename: tokens[2], size: textureSize })
                  const fitX = tokens[3] === 'fit-x' || tokens[3] === 'stretch'
                  const fitY = tokens[3] === 'fit-y' || tokens[3] === 'stretch'

                  wall[0] = { texture, fitX, fitY, isRemoved: false }
                  wall[1] = { texture, fitX, fitY, isRemoved: false }
                  wall[2] = { texture, fitX, fitY, isRemoved: false }
                  wall[3] = { texture, fitX, fitY, isRemoved: false }
                  break
                }

                case 'off': {
                  wall[0].isRemoved = true
                  wall[1].isRemoved = true
                  wall[2].isRemoved = true
                  wall[3].isRemoved = true
                  break
                }

                default: {
                  console.error(
                    `[error] loadRooms: Unknown texture type "${tokens[1]}" at line ${
                      i + 1
                    }, expected either "custom", "arx", or "off"`,
                  )
                }
              }

              break
            }

            case 'wall-north':
            case 'wall-east':
            case 'wall-south':
            case 'wall-west': {
              const wallIdx = tokens[0].endsWith('north')
                ? 0
                : tokens[0].endsWith('east')
                  ? 1
                  : tokens[0].endsWith('south')
                    ? 2
                    : 3

              const wall = roomDefinitions[currentBlock.name].textures.wall as QuadrupleOf<TextureDefinition>

              switch (tokens[1]) {
                case 'custom': {
                  const texture = Texture.fromCustomFile({ filename: tokens[3], sourcePath: tokens[2] })
                  const fitX = tokens[4] === 'fit-x' || tokens[4] === 'stretch'
                  const fitY = tokens[4] === 'fit-y' || tokens[4] === 'stretch'

                  wall[wallIdx] = { texture, fitX, fitY, isRemoved: false }
                  break
                }

                case 'arx': {
                  // TODO: an arx texture might not always be 128x128
                  const textureSize = 128

                  const texture = new Texture({ filename: tokens[2], size: textureSize })
                  const fitX = tokens[3] === 'fit-x' || tokens[3] === 'stretch'
                  const fitY = tokens[3] === 'fit-y' || tokens[3] === 'stretch'

                  wall[wallIdx] = { texture, fitX, fitY, isRemoved: false }
                  break
                }

                case 'off': {
                  wall[wallIdx].isRemoved = true
                  break
                }

                default: {
                  console.error(
                    `[error] loadRooms: Unknown texture type "${tokens[1]}" at line ${
                      i + 1
                    }, expected either "custom", "arx" or "off"`,
                  )
                }
              }

              break
            }

            default: {
              console.error(
                `[error] loadRooms: Unknown side "${tokens[0]}" at line ${
                  i + 1
                }, expected "floor", "ceiling", "wall", "wall-east", "wall-west", "wall-north" or "wall-south"`,
              )
            }
          }

          break
        }
      }
    }
  }

  rooms.unionAll()

  return rooms
}
