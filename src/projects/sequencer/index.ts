import path from 'node:path'
import seedrandom from 'seedrandom'
import { MathUtils, Vector2 } from 'three'
import { createPlaneMesh } from '@prefabs/mesh/plane.js'
import { ArxMap } from '@src/ArxMap.js'
import { Color } from '@src/Color.js'
import { DONT_QUADIFY, SHADING_SMOOTH } from '@src/Polygons.js'
import { Texture } from '@src/Texture.js'
import { Vector3 } from '@src/Vector3.js'
import { Rotation } from '@src/Rotation.js'
import { Button } from '@projects/sequencer/Button.js'
import { Timer } from '@projects/sequencer/Timer.js'
import { applyTransformations } from '@src/helpers.js'
import { scaleUV } from '@tools/mesh/scaleUV.js'
import { Lever } from '@projects/sequencer/Lever.js'
import { Cursor } from '@projects/sequencer/Cursor.js'
import { SoundPlayer } from '@projects/sequencer/SoundPlayer.js'
import { Audio } from '@src/Audio.js'
import { loadOBJ } from '@tools/mesh/loadOBJ.js'
import { ArxPolygonFlags } from 'arx-convert/types'
import { Material } from '@src/Material.js'
import { createLight } from '@tools/createLight.js'

const createFloor = async (position: Vector3, dimensions: Vector2) => {
  const discoTiles = Material.fromTexture(
    await Texture.fromCustomFile({
      filename: '[stone]-disco-floor.jpg',
      sourcePath: 'textures',
    }),
    {
      flags: ArxPolygonFlags.Tiled,
    },
  )

  const floor = await createPlaneMesh(dimensions, 100, Color.white.darken(50), discoTiles)
  scaleUV(new Vector2(0.5, 0.5), floor.geometry)
  floor.translateX(position.x)
  floor.translateY(position.y)
  floor.translateZ(position.z)

  return [floor]
}

const createWall = async (position: Vector3, dimensions: Vector2, direction: 'north' | 'west' | 'east' | 'south') => {
  const metal = Material.fromTexture(
    await Texture.fromCustomFile({
      filename: '[stone]-dark-brick-wall.jpg',
      sourcePath: 'textures',
    }),
    {
      flags: ArxPolygonFlags.Tiled,
    },
  )

  const wall = await createPlaneMesh(dimensions, 100, Color.white.darken(50), metal)
  wall.rotateX(MathUtils.degToRad(-90))
  if (direction === 'south') {
    wall.rotateZ(MathUtils.degToRad(180))
  }
  if (direction === 'west') {
    wall.rotateZ(MathUtils.degToRad(-90))
  }
  if (direction === 'east') {
    wall.rotateZ(MathUtils.degToRad(90))
  }
  scaleUV(new Vector2((1 / 3) * 2, (1 / 3) * 2), wall.geometry)
  applyTransformations(wall)

  wall.translateX(position.x)
  wall.translateY(position.y)
  wall.translateZ(position.z)

  return [wall]
}

const createSynth = async (position: Vector3, dimensions: Vector2) => {
  const metal = Material.fromTexture(
    await Texture.fromCustomFile({
      filename: 'dark-[metal]-grid.jpg',
      sourcePath: 'textures',
    }),
    {
      flags: ArxPolygonFlags.Tiled,
    },
  )

  const panel = await createPlaneMesh(dimensions, 100, Color.white.darken(50), metal)
  panel.rotateX(MathUtils.degToRad(-90))
  scaleUV(new Vector2(0.5, 0.5), panel.geometry)
  applyTransformations(panel)
  panel.translateX(position.x)
  panel.translateY(position.y)
  panel.translateZ(position.z)

  return [panel]
}

// prettier-ignore
const formattedButtonPattern = [
  '.... .... .... .... .... .... .... ....',
  '.... .... .... .... ..xx xx.. x... ....',
  '.... .... .... .... .... .... .... ....',
  '.... .... .... .... .... .... .... ....',
  '.... x... .... x... .... x... .... x...',
  'x.x. .x.. x.xx .x.. x.x. .x.. x... ...x',
]

export default async () => {
  const {
    OUTPUTDIR = path.resolve('./dist'),
    LEVEL = '1',
    SEED = Math.floor(Math.random() * 1e20).toString(),
  } = process.env

  seedrandom(SEED, { global: true })
  console.log(`seed: ${SEED}`)

  const map = new ArxMap()
  map.meta.mapName = 'Sequencer'
  map.meta.seed = SEED
  map.config.offset = new Vector3(6000, 0, 6000)
  map.player.withScript()
  map.player.position.adjustToPlayerHeight()
  map.hud.hide('all')

  // ----------------------

  const instruments = [
    new SoundPlayer({ audio: Audio.spiderStep3 }),
    new SoundPlayer({ audio: Audio.metalOnWood2 }),
    new SoundPlayer({ audio: Audio.sausageJump }),
    new SoundPlayer({ audio: Audio.footstepShoeMetalStep }),
    new SoundPlayer({ audio: Audio.interfaceInvstd }),
    new SoundPlayer({ audio: Audio.clothOnCloth1 }),
  ]

  const buttonPattern = formattedButtonPattern.map((row) => {
    return row.replaceAll(' ', '')
  })

  const numberOfBeats = buttonPattern[0].length

  const offsetLeft = -360

  const buttons: Button[][] = []
  for (let y = 0; y < formattedButtonPattern.length; y++) {
    const row: Button[] = []
    let cntr = -1
    for (let x = 0; x < formattedButtonPattern[y].length; x++) {
      if (formattedButtonPattern[y][x] === ' ') {
        continue
      }

      cntr++

      const button = new Button({
        position: new Vector3(offsetLeft + x * 20, -220 + y * 30, 400),
        orientation: new Rotation(0, MathUtils.degToRad(-90), 0),
      })
      if (formattedButtonPattern[y][x] === 'x') {
        button.on()
      }
      button.script?.on(
        'init',
        ((i) => () => {
          return `setgroup button_column_${i}`
        })(cntr),
      )
      button.script?.on('trigger', () => {
        return `
          if (^$param1 == "out") {
            sendevent play ${instruments[y].ref} nop
          }
        `
      })
      row.push(button)
    }
    buttons.push(row)
  }

  const timer = new Timer({ numberOfSteps: numberOfBeats, notesPerBeat: 4, bpm: 120 })

  const lever = new Lever({
    position: new Vector3(-40 + offsetLeft, -220 + (buttonPattern.length / 2) * 30 - 20, 400),
    orientation: new Rotation(MathUtils.degToRad(90), 0, 0),
  })

  const cursor = new Cursor({
    position: new Vector3(offsetLeft, -220 - 30, 400),
    orientation: new Rotation(0, MathUtils.degToRad(-90), 0),
  })

  // ----------------------

  timer.isMuted = false
  timer.script?.on('tick', () => {
    return `
      if (^#param1 == 0) {
        sendevent move_x ${cursor.ref} -${(numberOfBeats - 1 + 7) * 20}
      } else {
        if(^#param1 == 4) {
          sendevent move_x ${cursor.ref} 40
        } else {
          if (^#param1 == 8) {
            sendevent move_x ${cursor.ref} 40
          } else {
            if(^#param1 == 12) {
              sendevent move_x ${cursor.ref} 40
            } else {
              if(^#param1 == 16) {
                sendevent move_x ${cursor.ref} 40
              } else {
                if (^#param1 == 20) {
                  sendevent move_x ${cursor.ref} 40
                } else {
                  if(^#param1 == 24) {
                    sendevent move_x ${cursor.ref} 40
                  } else {
                    if(^#param1 == 28) {
                      sendevent move_x ${cursor.ref} 40
                    } else {
                      if (^#param1 == 32) {
                        sendevent move_x ${cursor.ref} 40
                      } else {
                        if(^#param1 == 36) {
                          sendevent move_x ${cursor.ref} 40
                        } else {
                          sendevent move_x ${cursor.ref} 20
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `
  })
  timer.script?.on('trigger', () => {
    return `
      sendevent -g "button_column_~^#param1~" trigger "in"
    `
  })

  lever.isPulled = !timer.isMuted
  lever.script?.on('custom', () => {
    return `
      if (^$param1 == "on") {
        sendevent custom ${timer.ref} "on"
      }
      if (^$param1 == "off") {
        sendevent custom ${timer.ref} "off"
      }
    `
  })

  Audio.mute(Audio.lever)

  // ----------------------

  const speakerL = await loadOBJ('models/speaker/speaker', {
    position: new Vector3(6000 - 540, 200, 6000 + 350),
    scale: 30,
    rotation: new Rotation(MathUtils.degToRad(-15), MathUtils.degToRad(60), MathUtils.degToRad(-15)),
    materialFlags: ArxPolygonFlags.None,
  })

  const speakerR = await loadOBJ('models/speaker/speaker', {
    position: new Vector3(6000 + 540, 200, 6000 + 350),
    scale: 30,
    rotation: new Rotation(MathUtils.degToRad(15), MathUtils.degToRad(180 - 60), MathUtils.degToRad(15)),
    materialFlags: ArxPolygonFlags.None,
  })

  const floor = await createFloor(new Vector3(6000, 0, 6000), new Vector2(1200, 850))

  const synth = await createSynth(
    new Vector3(6000 + 0, 150, 6000 + 400),
    new Vector2(formattedButtonPattern[0].length * 20 + 70, 190),
  )

  const wallN = await createWall(new Vector3(6000, 150, 6000 + 425), new Vector2(1200, 300), 'north')
  const wallS = await createWall(new Vector3(6000, 150, 6000 - 425), new Vector2(1200, 300), 'south')
  const wallW = await createWall(new Vector3(6000 - 600, 150, 6000), new Vector2(850, 300), 'west')
  const wallE = await createWall(new Vector3(6000 + 600, 150, 6000), new Vector2(850, 300), 'east')

  const meshes = [speakerL, speakerR, floor, synth, wallN, wallS, wallW, wallE].flat()

  meshes.forEach((mesh) => {
    map.polygons.addThreeJsMesh(mesh, { tryToQuadify: DONT_QUADIFY, shading: SHADING_SMOOTH })
  })

  map.entities.push(...buttons.flat(), timer, lever, cursor, ...instruments)

  const light = createLight({ position: new Vector3(0, -300, 0), radius: 2000 })
  map.lights.push(light)

  map.finalize()

  map.saveToDisk(OUTPUTDIR, parseInt(LEVEL))
}
