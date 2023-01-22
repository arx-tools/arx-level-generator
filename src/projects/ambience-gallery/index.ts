import path from 'node:path'
import seedrandom from 'seedrandom'
import { EdgesGeometry, MathUtils, Shape, ShapeGeometry, Vector2 } from 'three'
import { Ambience } from '@src/Ambience'
import { ArxMap } from '@src/ArxMap'
import { Color } from '@src/Color'
import { Entity } from '@src/Entity'
import { createPlaneMesh } from '@src/prefabs/mesh/plane'
import { Texture } from '@src/Texture'
import { Vector3 } from '@src/Vector3'
import { Zone } from '@src/Zone'
import { ControlZone } from '@src/scripting/properties/ControlZone'

const createZone = (pos: Vector3, size: Vector2, ambience: Ambience, height: number = Infinity) => {
  const shape = new Shape()
  shape.lineTo(size.x, 0)
  shape.lineTo(size.x, size.y)
  shape.lineTo(0, size.y)

  const geometry = new ShapeGeometry(shape)
  const edge = new EdgesGeometry(geometry)
  edge.rotateX(MathUtils.degToRad(90))
  edge.translate(pos.x, pos.y, pos.z)

  return Zone.fromThreejsGeometry(edge, {
    name: ambience.name,
    height,
    ambience,
  })
}

const ambiences = [
  Ambience.blackThing,
  Ambience.bunkerAkbaa,
  Ambience.bunker,
  Ambience.castle,
  Ambience.caveA,
  Ambience.caveB,
  Ambience.caveFrozen,
  Ambience.caveGreu,
  Ambience.caveLava,
  Ambience.caveWorm,
  Ambience.credits,
  Ambience.cryptA,
  Ambience.cryptB,
  Ambience.cryptC,
  Ambience.cryptD,
  Ambience.cryptE,
  Ambience.cryptF,
  Ambience.cryptLich,
  Ambience.dramatic,
  Ambience.dwarf,
  Ambience.fight,
  Ambience.fightMusic,
  Ambience.gobCastle,
  Ambience.gobIntro,
  Ambience.jailMain,
  Ambience.jailStress,
  Ambience.gobRuin,
  Ambience.importantPlace,
  Ambience.introA,
  Ambience.intro,
  Ambience.introB,
  Ambience.menu,
  Ambience.noden,
  Ambience.outpost,
  Ambience.rebelsCool,
  Ambience.rebelsIntense,
  Ambience.snakeCastle,
  Ambience.snakeIllusion,
  Ambience.tavern,
  Ambience.templeAkbaa,
  Ambience.templeAkbaaUp,
  Ambience.town,
  Ambience.troll,
  Ambience.reverbTest,
  Ambience.stress,
]

export default async () => {
  const {
    OUTPUTDIR = path.resolve(__dirname, './dist'),
    LEVEL = '1',
    SEED = Math.floor(Math.random() * 1e20).toString(),
  } = process.env

  seedrandom(SEED, { global: true })
  console.log(`seed: ${SEED}`)

  const map = new ArxMap()

  map.config.offset = new Vector3(2000, 0, 2000)
  map.player.position.adjustToPlayerHeight()
  map.player.orientation.y = MathUtils.degToRad(-90)
  map.hideMinimap()

  const rowSize = 5

  const width = Math.ceil(ambiences.length / rowSize) * 300 + 400
  const depth = rowSize * 300 + 200
  const floor = await createPlaneMesh(width, depth, Color.white, Texture.humanPaving1)
  floor.translateX(width / 2 - 200)
  map.add(ArxMap.fromThreeJsMesh(floor), true)

  const position = new Vector3(-200, 10, -depth / 2)
  const mainZone = createZone(position, new Vector2(width, depth), Ambience.none, 10)
  mainZone.backgroundColor = Color.fromCSS('#111')
  map.zones.push(mainZone)

  for (let i = 0; i < ambiences.length; i += rowSize) {
    const slice = ambiences.slice(i, i + rowSize)
    for (let j = 0; j < slice.length; j++) {
      const ambience = ambiences[i + j]

      const pos = new Vector3((i / rowSize) * 300 + 100, 30, j * 300 - depth / 2 + 200)
      const size = new Vector2(100, 100)

      const zone = createZone(pos, size, ambience, 50)
      map.zones.push(zone)

      const marker = Entity.marker.withScript()
      marker.position = pos.clone().add(new Vector3(50, -30, 50))
      marker.script?.properties.push(new ControlZone(zone))
      marker.script?.on('controlledzone_enter', () => {
        return `herosay "${zone.name}"`
      })
      map.entities.push(marker)

      const tile = await createPlaneMesh(size.x, size.y, Color.white, Texture.l2GobelCenter)
      tile.translateX(pos.x + 50)
      tile.translateY(pos.y)
      tile.translateZ(pos.z + 50)
      map.add(ArxMap.fromThreeJsMesh(tile), true)
    }
  }

  map.finalize()

  map.saveToDisk(OUTPUTDIR, parseInt(LEVEL))
}
