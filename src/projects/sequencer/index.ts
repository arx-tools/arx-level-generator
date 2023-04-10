import path from 'node:path'
import seedrandom from 'seedrandom'
import { MathUtils, Vector2 } from 'three'
import { createPlaneMesh } from '@prefabs/mesh/plane.js'
import { ArxMap } from '@src/ArxMap.js'
import { Color } from '@src/Color.js'
import { HudElements } from '@src/HUD.js'
import { DONT_QUADIFY } from '@src/Polygons.js'
import { Texture } from '@src/Texture.js'
import { Vector3 } from '@src/Vector3.js'
import { Rotation } from '@src/Rotation.js'
import { createLight } from '@projects/the-backrooms/light.js'
import { Button } from '@projects/sequencer/Button.js'
import { Timer } from '@projects/sequencer/Timer.js'
import { applyTransformations } from '@src/helpers.js'
import { scaleUV } from '@tools/mesh/scaleUV.js'
import { Lever } from '@projects/sequencer/Lever.js'
import { Cursor } from '@projects/sequencer/Cursor.js'
import { SoundPlayer } from '@projects/sequencer/SoundPlayer.js'

const createFloor = async (width: number, height: number) => {
  const mesh = await createPlaneMesh(
    new Vector2(width, height),
    100,
    Color.white.darken(50),
    Texture.stoneHumanStoneWall1,
  )
  return ArxMap.fromThreeJsMesh(mesh, { tryToQuadify: DONT_QUADIFY })
}

const createWall = async (width: number, height: number) => {
  const mesh = await createPlaneMesh(
    new Vector2(width, height),
    100,
    Color.white.darken(50),
    Texture.l4DwarfWoodBoard02,
  )
  mesh.rotateX(MathUtils.degToRad(-90))
  scaleUV(new Vector2(2, 2), mesh.geometry)
  applyTransformations(mesh)
  mesh.translateX(30)
  mesh.translateY(150)
  mesh.translateZ(400)
  return ArxMap.fromThreeJsMesh(mesh, { tryToQuadify: DONT_QUADIFY })
}

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
  map.hud.hide(HudElements.Minimap)

  map.add(await createFloor(1000, 1000), true)
  map.add(await createWall(420, 190), true)

  // ----------------------

  const instruments = [
    new SoundPlayer({ filename: 'rat_step4' }),
    new SoundPlayer({ filename: 'sausage_jump' }),
    new SoundPlayer({ filename: 'metal_on_earth_1' }),
    new SoundPlayer({ filename: 'footstep_shoe_metal_step' }),
    new SoundPlayer({ filename: 'interface_invstd' }),
    new SoundPlayer({ filename: 'cloth_on_cloth_1' }),
  ]

  // prettier-ignore
  // const buttonPattern = [
  //   'xxxxxxxxxxxxxxxx',
  //   '..........xx..x.',
  //   'x...............',
  //   'x..x..x.........',
  //   '....x.......x...',
  //   'x...x...x...x...',
  // ]

  // prettier-ignore
  const buttonPattern = [
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
  ]

  const buttons: Button[][] = []
  for (let y = 0; y < buttonPattern.length; y++) {
    const row: Button[] = []
    for (let x = 0; x < buttonPattern[y].length; x++) {
      const button = new Button({
        position: new Vector3(-100 + x * 20, -220 + y * 30, 400),
        orientation: new Rotation(0, MathUtils.degToRad(-90), 0),
      })
      if (buttonPattern[y][x] === 'x') {
        button.on()
      }
      button.script?.on('init', () => {
        return `setgroup button_column_${x}`
      })
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

  const timer = new Timer({})

  const lever = new Lever({
    position: new Vector3(-140, -220 + (buttonPattern.length / 2) * 30 - 20, 400),
    orientation: new Rotation(MathUtils.degToRad(90), 0, 0),
  })

  const cursor = new Cursor({
    position: new Vector3(-100, -220 - 30, 400),
    orientation: new Rotation(0, MathUtils.degToRad(-90), 0),
  })

  // ----------------------

  timer.isMuted = false
  timer.script?.on('tick', () => {
    return `
      if (^#param1 == 0) {
        sendevent move_x ${cursor.ref} -300
      } else {
        sendevent move_x ${cursor.ref} 20
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

  // ----------------------

  map.entities.push(...buttons.flat(), timer, lever, cursor, ...instruments)

  const light = createLight(new Vector3(0, -300, 0), 2000)
  map.lights.push(light)

  map.finalize()

  map.saveToDisk(OUTPUTDIR, parseInt(LEVEL))
}
