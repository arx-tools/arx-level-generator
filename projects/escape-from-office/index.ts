import path from 'node:path'
import { ArxPolygonFlags } from 'arx-convert/types'
import seedrandom from 'seedrandom'
import { MathUtils } from 'three'
import { ArxMap } from '@src/ArxMap.js'
import { Color } from '@src/Color.js'
import { DONT_QUADIFY, SHADING_FLAT, SHADING_SMOOTH } from '@src/Polygons.js'
import { Rotation } from '@src/Rotation.js'
import { Vector3 } from '@src/Vector3.js'
import { applyTransformations } from '@src/helpers.js'
import { loadRooms } from '@prefabs/rooms/loadRooms.js'
import { createZone } from '@tools/createZone.js'
import { loadOBJ } from '@tools/mesh/loadOBJ.js'

// import { createLight } from '@tools/createLight.js'

export default async () => {
  const {
    OUTPUTDIR = path.resolve('./dist'),
    LEVEL = '1',
    SEED = Math.floor(Math.random() * 1e20).toString(),
  } = process.env

  seedrandom(SEED, { global: true })
  console.log(`seed: ${SEED}`)

  const map = new ArxMap()
  map.meta.mapName = 'Escape from office'
  map.meta.seed = SEED
  map.config.offset = new Vector3(6000, 0, 6000)
  map.player.position.adjustToPlayerHeight()
  map.player.withScript()
  map.hud.hide('all')

  // --------------

  const rooms = await loadRooms('projects/escape-from-office/escape-from-office.rooms')
  rooms.forEach((room) => {
    map.add(room, true)
  })

  const wetFloorSign = await loadOBJ('models/wet-floor-sign/wet-floor-sign', {
    position: new Vector3(-250, -30, 410),
    rotation: new Rotation(0, MathUtils.degToRad(30), 0),
    scale: 0.3,
    materialFlags: ArxPolygonFlags.NoShadow,
  })

  const ceilingLampOffice1 = await loadOBJ('models/ceiling-lamp/ceiling-lamp', {
    position: new Vector3(-24, -308, 54),
    scale: 0.65,
    materialFlags: ArxPolygonFlags.NoShadow | ArxPolygonFlags.Glow,
  })

  const ceilingLampOffice2 = await loadOBJ('models/ceiling-lamp/ceiling-lamp', {
    position: new Vector3(-24, -308, 54 + 840),
    scale: 0.65,
    materialFlags: ArxPolygonFlags.NoShadow | ArxPolygonFlags.Glow,
  })

  const hardModels = [...wetFloorSign]
  const smoothModels = [...ceilingLampOffice1, ...ceilingLampOffice2]

  const spawnZone = createZone({
    position: new Vector3(0, 10, 0),
    name: 'spawn',
    backgroundColor: Color.fromCSS('skyblue'),
  })

  const zones = [spawnZone]

  // const sun = createLight({ position: new Vector3(0, -200, -1000), radius: 2000 })

  // const lights = [sun]

  // --------------

  hardModels.forEach((mesh) => {
    mesh.translateX(map.config.offset.x)
    mesh.translateY(map.config.offset.y)
    mesh.translateZ(map.config.offset.z)
    applyTransformations(mesh)
    map.polygons.addThreeJsMesh(mesh, { tryToQuadify: DONT_QUADIFY, shading: SHADING_FLAT })
  })

  smoothModels.forEach((mesh) => {
    mesh.translateX(map.config.offset.x)
    mesh.translateY(map.config.offset.y)
    mesh.translateZ(map.config.offset.z)
    applyTransformations(mesh)
    map.polygons.addThreeJsMesh(mesh, { tryToQuadify: DONT_QUADIFY, shading: SHADING_SMOOTH })
  })

  map.zones.push(...zones)
  // map.lights.push(...lights)

  map.finalize()
  map.saveToDisk(OUTPUTDIR, parseInt(LEVEL))
}
