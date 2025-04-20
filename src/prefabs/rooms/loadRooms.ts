import fs from 'node:fs/promises'
import path from 'node:path'
import type { QuadrupleOf } from 'arx-convert/utils'
import type { Settings } from '@src/Settings.js'
import { Texture } from '@src/Texture.js'
import { Vector3 } from '@src/Vector3.js'
import { Cursor, type CursorDir } from '@prefabs/rooms/Cursor.js'
import { Rooms } from '@prefabs/rooms/Rooms.js'
import type { RoomTextures, RoomProps, TextureDefinition } from '@prefabs/rooms/room.js'
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

function tryParsingTokenAsVariable(token: string, variables: Record<string, string>): string {
  if (!token.startsWith('$')) {
    return token
  }

  return variables[token]
}

// eslint-disable-next-line max-params -- this will get resolved by the new tokenizer/parser
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
        const posX = Number.parseInt(tryParsingTokenAsVariable(tokens[2], variables), 10)
        const posY = Number.parseInt(tryParsingTokenAsVariable(tokens[3], variables), 10)
        const posZ = Number.parseInt(tryParsingTokenAsVariable(tokens[4], variables), 10)
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
  if (tokens[1] !== '=') {
    console.error(`[error] loadRooms: Unexpected token "${tokens[1]}" after variable at line ${lineNumber}`)
    return
  }

  if (tokens[2] === undefined) {
    console.error(`[error] loadRooms: Missing value for variable at line ${lineNumber}`)
    return
  }

  variables[tokens[0]] = tokens[2]
}

function generateBaseRoomTextures(separateWalls: boolean = false): RoomTextures {
  const roomTextures: RoomTextures = {
    ceiling: { texture: Texture.missingTexture, fitX: false, fitY: false, scale: 1, isRemoved: false },
    wall: { texture: Texture.missingTexture, fitX: false, fitY: false, scale: 1, isRemoved: false },
    floor: { texture: Texture.missingTexture, fitX: false, fitY: false, scale: 1, isRemoved: false },
  }

  if (separateWalls) {
    roomTextures.wall = [
      { texture: Texture.missingTexture, fitX: false, fitY: false, scale: 1, isRemoved: false },
      { texture: Texture.missingTexture, fitX: false, fitY: false, scale: 1, isRemoved: false },
      { texture: Texture.missingTexture, fitX: false, fitY: false, scale: 1, isRemoved: false },
      { texture: Texture.missingTexture, fitX: false, fitY: false, scale: 1, isRemoved: false },
    ]
  }

  return roomTextures
}

function getWallIdxFromToken(token: 'wall-north' | 'wall-east' | 'wall-south' | 'wall-west'): 0 | 1 | 2 | 3 {
  if (token.endsWith('north')) {
    return 0
  }

  if (token.endsWith('east')) {
    return 1
  }

  if (token.endsWith('south')) {
    return 2
  }

  return 3
}

// eslint-disable-next-line complexity -- this will get resolved by the new tokenizer/parser
export async function loadRooms(filename: string, settings: Settings): Promise<Rooms> {
  const cursor = new Cursor()
  const rooms = new Rooms(cursor)

  const roomDefinitions: Record<string, RoomProps> = {
    default: {
      textures: generateBaseRoomTextures(),
    },
  }

  const variables: Record<string, string> = {}

  const source = path.resolve(settings.assetsDir, filename)
  const rawInput = await fs.readFile(source, { encoding: 'utf8' })
  const lines = rawInput.split(/\r?\n/)

  let currentBlock: CurrentBlock | undefined

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].replace(/#.*$/, '').trim()

    if (line === '') {
      continue
    }

    const tokens = line.split(' ')

    const lineNumber = i + 1

    if (currentBlock === undefined) {
      switch (tokens[0]) {
        case 'define': {
          if (tokens[1] === undefined) {
            console.error(`[error] loadRooms: missing define block's name at line ${lineNumber}`)
          } else if (tokens[2] === '{') {
            currentBlock = { type: 'define', name: tokens[1] }

            // eslint-disable-next-line max-depth -- this will get resolved by the new tokenizer/parser
            if (roomDefinitions[tokens[1]] === undefined) {
              roomDefinitions[tokens[1]] = {
                textures: generateBaseRoomTextures(true),
              }
            }
          } else {
            console.error(`[error] loadRooms: missing { at line ${lineNumber}`)
          }

          break
        }

        case 'room': {
          parseRoomKeyword(tokens, rooms, variables, roomDefinitions, lineNumber)
          break
        }

        case 'with': {
          parseWithKeyword(tokens, cursor, rooms, lineNumber)
          break
        }

        case 'cursor': {
          parseCursorKeyword(tokens, cursor, lineNumber)
          break
        }

        default: {
          if (tokens[0].startsWith('$')) {
            parseVariable(tokens, variables, lineNumber)
          } else {
            console.error(`[error] loadRooms: Unknown command "${tokens[0]}" at line ${lineNumber}`)
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
                  let scale = 1
                  if (fitX === false && fitY === false && /^scale:\d+(\.\d+)?$/.test(tokens[4])) {
                    scale = Number.parseFloat(tokens[4].split(':')[1])
                  }

                  roomDefinitions[currentBlock.name].textures[tokens[0]] = {
                    texture,
                    fitX,
                    fitY,
                    scale,
                    isRemoved: false,
                  }
                  break
                }

                case 'arx': {
                  // TODO: an arx texture might not always be 128x128
                  const textureSize = 128

                  const texture = new Texture({ filename: tokens[2], size: textureSize })
                  const fitX = tokens[3] === 'fit-x' || tokens[3] === 'stretch'
                  const fitY = tokens[3] === 'fit-y' || tokens[3] === 'stretch'
                  let scale = 1
                  if (fitX === false && fitY === false && /^scale:\d+(\.\d+)?$/.test(tokens[3])) {
                    scale = Number.parseFloat(tokens[3].split(':')[1])
                  }

                  roomDefinitions[currentBlock.name].textures[tokens[0]] = {
                    texture,
                    fitX,
                    fitY,
                    scale,
                    isRemoved: false,
                  }
                  break
                }

                case 'off': {
                  roomDefinitions[currentBlock.name].textures[tokens[0]].isRemoved = true
                  break
                }

                default: {
                  console.error(
                    `[error] loadRooms: Unknown texture type "${tokens[1]}" at line ${
                      lineNumber
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
                  let scale = 1
                  if (fitX === false && fitY === false && /^scale:\d+(\.\d+)?$/.test(tokens[4])) {
                    scale = Number.parseFloat(tokens[4].split(':')[1])
                  }

                  wall[0] = { texture, fitX, fitY, scale, isRemoved: false }
                  wall[1] = { texture, fitX, fitY, scale, isRemoved: false }
                  wall[2] = { texture, fitX, fitY, scale, isRemoved: false }
                  wall[3] = { texture, fitX, fitY, scale, isRemoved: false }
                  break
                }

                case 'arx': {
                  // TODO: an arx texture might not always be 128x128
                  const textureSize = 128

                  const texture = new Texture({ filename: tokens[2], size: textureSize })
                  const fitX = tokens[3] === 'fit-x' || tokens[3] === 'stretch'
                  const fitY = tokens[3] === 'fit-y' || tokens[3] === 'stretch'
                  let scale = 1
                  if (fitX === false && fitY === false && /^scale:\d+(\.\d+)?$/.test(tokens[3])) {
                    scale = Number.parseFloat(tokens[3].split(':')[1])
                  }

                  wall[0] = { texture, fitX, fitY, scale, isRemoved: false }
                  wall[1] = { texture, fitX, fitY, scale, isRemoved: false }
                  wall[2] = { texture, fitX, fitY, scale, isRemoved: false }
                  wall[3] = { texture, fitX, fitY, scale, isRemoved: false }
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
                      lineNumber
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
              const wallIdx = getWallIdxFromToken(tokens[0])
              const wall = roomDefinitions[currentBlock.name].textures.wall as QuadrupleOf<TextureDefinition>

              switch (tokens[1]) {
                case 'custom': {
                  const texture = Texture.fromCustomFile({ filename: tokens[3], sourcePath: tokens[2] })
                  const fitX = tokens[4] === 'fit-x' || tokens[4] === 'stretch'
                  const fitY = tokens[4] === 'fit-y' || tokens[4] === 'stretch'
                  let scale = 1
                  if (fitX === false && fitY === false && /^scale:\d+(\.\d+)?$/.test(tokens[4])) {
                    scale = Number.parseFloat(tokens[4].split(':')[1])
                  }

                  wall[wallIdx] = { texture, fitX, fitY, scale, isRemoved: false }
                  break
                }

                case 'arx': {
                  // TODO: an arx texture might not always be 128x128
                  const textureSize = 128

                  const texture = new Texture({ filename: tokens[2], size: textureSize })
                  const fitX = tokens[3] === 'fit-x' || tokens[3] === 'stretch'
                  const fitY = tokens[3] === 'fit-y' || tokens[3] === 'stretch'
                  let scale = 1
                  if (fitX === false && fitY === false && /^scale:\d+(\.\d+)?$/.test(tokens[3])) {
                    scale = Number.parseFloat(tokens[3].split(':')[1])
                  }

                  wall[wallIdx] = { texture, fitX, fitY, scale, isRemoved: false }
                  break
                }

                case 'off': {
                  wall[wallIdx].isRemoved = true
                  break
                }

                default: {
                  console.error(
                    `[error] loadRooms: Unknown texture type "${tokens[1]}" at line ${
                      lineNumber
                    }, expected either "custom", "arx" or "off"`,
                  )
                }
              }

              break
            }

            default: {
              console.error(
                `[error] loadRooms: Unknown side "${tokens[0]}" at line ${
                  lineNumber
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
