import path from 'node:path'
import { ArxPolygonFlags } from 'arx-convert/types'
import seedrandom from 'seedrandom'
import { MathUtils, Vector2 } from 'three'
import { ArxMap } from '@src/ArxMap.js'
import { Audio } from '@src/Audio.js'
import { Entity } from '@src/Entity.js'
import { HudElements } from '@src/HUD.js'
import { Material } from '@src/Material.js'
import { DONT_QUADIFY, SHADING_SMOOTH } from '@src/Polygons.js'
import { Rotation } from '@src/Rotation.js'
import { Texture } from '@src/Texture.js'
import { UiElements } from '@src/UI.js'
import { Vector3 } from '@src/Vector3.js'
import { times } from '@src/faux-ramda.js'
import { applyTransformations } from '@src/helpers.js'
import { pickRandom, randomBetween, randomSort } from '@src/random.js'
import { CatacombHeavyDoor, LightDoor } from '@prefabs/entity/Door.js'
import { Lever } from '@prefabs/entity/Lever.js'
import { Rune } from '@prefabs/entity/Rune.js'
import { SoundPlayer } from '@prefabs/entity/SoundPlayer.js'
import { createPlaneMesh } from '@prefabs/mesh/plane.js'
import { loadRooms } from '@prefabs/rooms/loadRooms.js'
import { createMoon } from '@projects/ambience-gallery/moon.js'
import { SoundFlags } from '@scripting/classes/Sound.js'
import { Interactivity } from '@scripting/properties/Interactivity.js'
import { Label } from '@scripting/properties/Label.js'
import { Scale } from '@scripting/properties/Scale.js'
import { createZone } from '@tools/createZone.js'
import { loadOBJ } from '@tools/mesh/loadOBJ.js'
import { Goblin } from './Goblin.js'
import { PCGame, PCGameVariant } from './PCGame.js'
import { createGameStateMarker } from './gameStateMarker.js'
import { createRadio } from './radio.js'
import { createTable } from './table.js'

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
  map.hud.show(HudElements.Manabar)
  map.hud.show(HudElements.BookIcon)
  map.hud.show(HudElements.BackpackIcon)
  map.ui.set(UiElements.MainMenuBackground, 'projects/lalees-minigame/ui/menu_main_background.jpg')
  await map.i18n.addFromFile('projects/lalees-minigame/i18n.json')

  // --------------

  const rooms = await loadRooms('assets/projects/lalees-minigame/house.rooms')
  rooms.forEach((room) => {
    map.add(room, true)
  })

  const gameVariants = randomSort([
    'mesterlovesz',
    'mortyr',
    'wolfschanze',
    'traktor-racer',
    'americas-10-most-wanted',
    'big-rigs',
    'streets-racer',
    'bikini-karate-babes',
  ] as PCGameVariant[])

  const runeComunicatum = new Rune('comunicatum')

  const barrel = Entity.barrel
  barrel.position = new Vector3(1650, 0, -960)
  barrel.withScript()
  barrel.script?.properties.push(new Scale(0.7))
  barrel.script?.on('init', () => {
    return `inventory addfromscene ${runeComunicatum.ref}`
  })

  map.entities.push(runeComunicatum, barrel)

  const game1 = new PCGame({
    variant: gameVariants[0],
    position: new Vector3(1700, -5, -50),
    orientation: new Rotation(MathUtils.degToRad(45), MathUtils.degToRad(80), MathUtils.degToRad(15)),
  })

  const fern = Entity.fern.withScript()
  fern.position = new Vector3(1650, 0, -60)
  fern.orientation = new Rotation(MathUtils.degToRad(0), MathUtils.degToRad(90), MathUtils.degToRad(0))
  fern.script?.properties.push(Interactivity.off, new Scale(2))

  map.entities.push(game1, fern)

  const game2 = new PCGame({
    variant: gameVariants[1],
    position: new Vector3(-1650, -5, -670),
  })

  const randomJunk = times(() => {
    const item = pickRandom([
      Entity.brokenBottle,
      Entity.brokenShield,
      Entity.brokenStool,
      Entity.akbaaBloodChickenHead,
    ]).withScript()
    item.position = game2.position
      .clone()
      .add(new Vector3(randomBetween(-30, 80), randomBetween(-5, 5), randomBetween(-50, 50)))
    item.orientation = new Rotation(
      MathUtils.degToRad(randomBetween(-45, 45)),
      MathUtils.degToRad(randomBetween(0, 360)),
      MathUtils.degToRad(randomBetween(-45, 45)),
    )
    return item
  }, Math.round(randomBetween(7, 12)))

  map.entities.push(game2, ...randomJunk)

  const doorToRoomA = new LightDoor({
    isLocked: true,
    position: new Vector3(800, 20, 120),
    orientation: new Rotation(0, MathUtils.degToRad(-90), 0),
  })
  const doorToRoomB = new LightDoor({
    isLocked: true,
    position: new Vector3(850, -200, 120),
    orientation: new Rotation(0, MathUtils.degToRad(-90), MathUtils.degToRad(180)),
  })
  map.entities.push(doorToRoomA, doorToRoomB)

  const doorToBackGarden = new CatacombHeavyDoor({
    position: new Vector3(100, 10, 580),
    orientation: new Rotation(0, MathUtils.degToRad(-90), 0),
  })
  doorToBackGarden.script?.properties.push(new Scale(1.35))
  map.entities.push(doorToBackGarden)

  const spawnZone = createZone({
    name: 'spawn',
    drawDistance: 5000,
  })
  map.zones.push(spawnZone)

  const moon = createMoon({
    position: new Vector3(300, -750, 1500),
    size: 30,
    lightRadius: 1500,
    moonOffset: new Vector3(100, 100, 50),
  })

  const tree = await loadOBJ('models/tree/tree', {
    position: new Vector3(200, -10, 1300),
    scale: 0.7,
    rotation: new Rotation(0, MathUtils.degToRad(70), 0),
    fallbackTexture: Texture.l2TrollWoodPillar08,
  })

  const lantern = new Entity({
    src: 'items/provisions/lamp',
    position: new Vector3(140, 7, 1370),
  })
  map.entities.push(lantern)

  const windowGlass = await createPlaneMesh({
    size: new Vector2(500, 350),
    texture: Material.fromTexture(Texture.glassGlass01, {
      opacity: 0.7,
      flags: ArxPolygonFlags.DoubleSided | ArxPolygonFlags.NoShadow,
    }),
    tileUV: true,
  })
  windowGlass.translateY(-200)
  windowGlass.translateZ(-575)
  windowGlass.rotateX(MathUtils.degToRad(-90))

  const leftTable = createTable({
    position: new Vector3(-300, -100, 400),
  })

  map.lights.push(...moon.lights)

  const soundOfCrickets = await Audio.fromCustomFile({
    filename: 'crickets.wav',
    sourcePath: 'projects/forest/sounds',
  })
  const crickets1 = new SoundPlayer({
    audio: soundOfCrickets,
    position: new Vector3(500, -100, 1800),
    flags: SoundFlags.Loop | SoundFlags.VaryPitch,
    autoplay: true,
  })
  const crickets2 = new SoundPlayer({
    audio: soundOfCrickets,
    position: new Vector3(-700, -70, 1500),
    flags: SoundFlags.Loop | SoundFlags.VaryPitch,
    autoplay: true,
  })
  const crickets3 = new SoundPlayer({
    audio: soundOfCrickets,
    position: new Vector3(0, -200, 2100),
    flags: SoundFlags.Loop | SoundFlags.VaryPitch,
    autoplay: true,
  })

  const crickets4 = new SoundPlayer({
    audio: soundOfCrickets,
    position: new Vector3(1800, 0, -1100),
    flags: SoundFlags.Loop | SoundFlags.VaryPitch,
    autoplay: true,
  })

  map.entities.push(crickets1, crickets2, crickets3, crickets4)

  const runeSpacium = new Rune('spacium')
  runeSpacium.position = new Vector3(-300, -107, 450)
  map.entities.push(runeSpacium)

  const gameStateMarker = createGameStateMarker()

  const goblin = new Goblin({
    position: new Vector3(-200, -2, 425),
    orientation: new Rotation(0, MathUtils.degToRad(-100), 0),
  })

  goblin.script?.on('combine', () => {
    return `
    if (^$param1 isclass pcgame) {
      sendevent gave_game_to_goblin ${gameStateMarker.ref} nop

      random 20 {
        speak [goblin_victory3_shorter]
      } else {
        speak [goblin_ok]
      }

      destroy ^$param1
    } else {
      speak -a [goblin_mad]
    }
    `
  })

  map.entities.push(gameStateMarker, goblin)

  const radio = await createRadio({
    position: new Vector3(300, -100, 450),
    angleY: 60,
    scale: 0.1,
    music: await Audio.fromCustomFile({
      filename: 'lalee-theme-song.wav',
      sourcePath: 'projects/lalees-minigame/sfx',
    }),
  })
  map.entities.push(...radio.entities)

  const meshes = [moon.meshes, tree, windowGlass, leftTable, radio.meshes]

  meshes.flat().forEach((mesh) => {
    applyTransformations(mesh)
    mesh.translateX(map.config.offset.x)
    mesh.translateY(map.config.offset.y)
    mesh.translateZ(map.config.offset.z)
    applyTransformations(mesh)
    map.polygons.addThreeJsMesh(mesh, { tryToQuadify: DONT_QUADIFY, shading: SHADING_SMOOTH })
  })

  // --------------

  map.finalize()
  map.saveToDisk(OUTPUTDIR, parseInt(LEVEL))
}
