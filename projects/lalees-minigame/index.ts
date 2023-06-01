import path from 'node:path'
import seedrandom from 'seedrandom'
import { MathUtils, Vector2 } from 'three'
import { ArxMap } from '@src/ArxMap.js'
import { Color } from '@src/Color.js'
import { DONT_QUADIFY, SHADING_SMOOTH } from '@src/Polygons.js'
import { Rotation } from '@src/Rotation.js'
import { Texture } from '@src/Texture.js'
import { UiElements } from '@src/UI.js'
import { Vector3 } from '@src/Vector3.js'
import { randomBetween } from '@src/random.js'
import { createPlaneMesh } from '@prefabs/mesh/plane.js'
import { PCGame } from '@projects/lalees-minigame/PCGame.js'
import { createLight } from '@tools/createLight.js'
import { createZone } from '@tools/createZone.js'
import { makeBumpy } from '@tools/mesh/makeBumpy.js'

export default async () => {
  const {
    OUTPUTDIR = path.resolve('./dist'),
    LEVEL = '1',
    SEED = Math.floor(Math.random() * 1e20).toString(),
  } = process.env

  seedrandom(SEED, { global: true })
  console.log(`seed: ${SEED}`)

  const map = new ArxMap()
  map.meta.mapName = "LaLee's minigame"
  map.meta.seed = SEED
  map.config.offset = new Vector3(6000, 0, 6000)
  map.player.position.adjustToPlayerHeight()
  map.player.withScript()
  map.hud.hide('all')
  map.ui.set(UiElements.MainMenuBackground, 'projects/lalees-minigame/ui/menu_main_background.jpg')
  await map.i18n.addFromFile('projects/lalees-minigame/i18n.json')

  // --------------

  const floorMesh = await createPlaneMesh(
    new Vector2(500, 500),
    100,
    Color.fromCSS('white'),
    Texture.l4DwarfWoodBoard02,
  )
  makeBumpy(10, 30, false, floorMesh.geometry)
  const floor = ArxMap.fromThreeJsMesh(floorMesh, { tryToQuadify: DONT_QUADIFY, shading: SHADING_SMOOTH })
  map.add(floor, true)

  const light = createLight({
    position: new Vector3(0, -200, 0),
    radius: 250,
    intensity: 3,
  })

  map.lights.push(light)

  map.entities.push(
    new PCGame({
      variant: 'mesterlovesz',
      position: new Vector3(randomBetween(-100, 100), randomBetween(-20, 0), randomBetween(-100, 100)),
      orientation: new Rotation(0, MathUtils.degToRad(randomBetween(-90, 90)), 0),
    }),
    new PCGame({
      variant: 'mortyr',
      position: new Vector3(randomBetween(-100, 100), randomBetween(-20, 0), randomBetween(-100, 100)),
      orientation: new Rotation(0, MathUtils.radToDeg(randomBetween(-90, 90)), 0),
    }),
    new PCGame({
      variant: 'wolfschanze',
      position: new Vector3(randomBetween(-100, 100), randomBetween(-20, 0), randomBetween(-100, 100)),
      orientation: new Rotation(0, MathUtils.radToDeg(randomBetween(-90, 90)), 0),
    }),
    new PCGame({
      variant: 'traktor-racer',
      position: new Vector3(randomBetween(-100, 100), randomBetween(-20, 0), randomBetween(-100, 100)),
      orientation: new Rotation(0, MathUtils.radToDeg(randomBetween(-90, 90)), 0),
    }),
    new PCGame({
      variant: 'americas-10-most-wanted',
      position: new Vector3(randomBetween(-100, 100), randomBetween(-20, 0), randomBetween(-100, 100)),
      orientation: new Rotation(0, MathUtils.radToDeg(randomBetween(-90, 90)), 0),
    }),
    new PCGame({
      variant: 'big-rigs',
      position: new Vector3(randomBetween(-100, 100), randomBetween(-20, 0), randomBetween(-100, 100)),
      orientation: new Rotation(0, MathUtils.radToDeg(randomBetween(-90, 90)), 0),
    }),
    new PCGame({
      variant: 'streets-racer',
      position: new Vector3(randomBetween(-100, 100), randomBetween(-20, 0), randomBetween(-100, 100)),
      orientation: new Rotation(0, MathUtils.radToDeg(randomBetween(-90, 90)), 0),
    }),
    new PCGame({
      variant: 'bikini-karate-babes',
      position: new Vector3(randomBetween(-100, 100), randomBetween(-20, 0), randomBetween(-100, 100)),
      orientation: new Rotation(0, MathUtils.radToDeg(randomBetween(-90, 90)), 0),
    }),
  )

  const spawnZone = createZone({
    name: 'spawn',
    backgroundColor: Color.fromCSS('white').darken(30),
    drawDistance: 5000,
  })
  map.zones.push(spawnZone)

  // --------------

  map.finalize()
  map.saveToDisk(OUTPUTDIR, parseInt(LEVEL))
}
