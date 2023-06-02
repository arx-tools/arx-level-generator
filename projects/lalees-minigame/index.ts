import path from 'node:path'
import seedrandom from 'seedrandom'
import { MathUtils } from 'three'
import { ArxMap } from '@src/ArxMap.js'
import { Entity } from '@src/Entity.js'
import { HudElements } from '@src/HUD.js'
import { Rotation } from '@src/Rotation.js'
import { UiElements } from '@src/UI.js'
import { Vector3 } from '@src/Vector3.js'
import { pickRandoms, randomSort } from '@src/random.js'
import { LightDoor } from '@prefabs/entity/Door.js'
import { Rune } from '@prefabs/entity/Rune.js'
import { loadRooms } from '@prefabs/rooms/loadRooms.js'
import { Interactivity } from '@scripting/properties/Interactivity.js'
import { Scale } from '@scripting/properties/Scale.js'
import { Speed } from '@scripting/properties/Speed.js'
import { createZone } from '@tools/createZone.js'
import { PCGame, PCGameVariant } from './PCGame.js'

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

  const runeSpacium = new Rune('spacium')
  const runeComunicatum = new Rune('comunicatum')

  const barrel = Entity.barrel
  barrel.position = new Vector3(1650, 0, -960)
  barrel.withScript()
  barrel.script?.properties.push(new Scale(0.7))
  barrel.script?.on('init', () => {
    return `inventory addfromscene ${runeComunicatum.ref}`
  })

  map.entities.push(runeSpacium, runeComunicatum, barrel)

  map.player.script?.properties.push(new Speed(1.3))
  map.player.script?.on('init', () => {
    return `inventory addfromscene ${runeSpacium.ref}`
  })

  const game1 = new PCGame({
    variant: gameVariants[0],
    position: new Vector3(1700, -5, -50),
    orientation: new Rotation(MathUtils.degToRad(45), MathUtils.degToRad(80), MathUtils.degToRad(15)),
  })

  // game2 -> in the dark outside south

  const fern = Entity.fern.withScript()
  fern.position = new Vector3(1650, 0, -60)
  fern.orientation = new Rotation(MathUtils.degToRad(0), MathUtils.degToRad(90), MathUtils.degToRad(0))
  fern.script?.properties.push(Interactivity.off, new Scale(2))

  map.entities.push(game1, fern)

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

  const spawnZone = createZone({
    name: 'spawn',
    drawDistance: 5000,
  })
  map.zones.push(spawnZone)

  // --------------

  map.finalize()
  map.saveToDisk(OUTPUTDIR, parseInt(LEVEL))
}
