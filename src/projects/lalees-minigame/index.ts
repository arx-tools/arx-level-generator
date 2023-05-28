import { createPlaneMesh } from '@prefabs/mesh/plane.js'
import { ArxMap } from '@src/ArxMap.js'
import { Color } from '@src/Color.js'
import { DONT_QUADIFY, SHADING_SMOOTH } from '@src/Polygons.js'
import { Rotation } from '@src/Rotation.js'
import { Texture } from '@src/Texture.js'
import { Vector3 } from '@src/Vector3.js'
import { applyTransformations } from '@src/helpers.js'
import { createZone } from '@tools/createZone.js'
import { loadOBJ } from '@tools/mesh/loadOBJ.js'
import { makeBumpy } from '@tools/mesh/makeBumpy.js'
import { ArxPolygonFlags } from 'arx-convert/types'
import path from 'node:path'
import seedrandom from 'seedrandom'
import { MathUtils, Vector2 } from 'three'
import { floor } from 'three/examples/jsm/nodes/Nodes.js'

export default async () => {
  const {
    OUTPUTDIR = path.resolve('./dist'),
    LEVEL = '1',
    SEED = Math.floor(Math.random() * 1e20).toString(),
  } = process.env

  seedrandom(SEED, { global: true })
  console.log(`seed: ${SEED}`)

  const map = new ArxMap()
  map.meta.mapName = "Lalee's minigame"
  map.meta.seed = SEED
  map.config.offset = new Vector3(6000, 0, 6000)
  map.player.position.adjustToPlayerHeight()
  map.player.withScript()
  map.hud.hide('all')

  // --------------

  const floorMesh = await createPlaneMesh(
    new Vector2(500, 500),
    100,
    Color.fromCSS('white'),
    Texture.l4DwarfWoodBoard02,
  )
  makeBumpy(10, 30, false, floorMesh.geometry)
  const floor = ArxMap.fromThreeJsMesh(floorMesh, { tryToQuadify: "don't quadify", shading: SHADING_SMOOTH })
  map.add(floor, true)

  const pcGameBox = await loadOBJ('projects/lalees-minigame/evm-box', {
    position: new Vector3(100, -100, 100),
    scale: 0.1,
    rotation: new Rotation(MathUtils.degToRad(-45), MathUtils.degToRad(-45 - 90), 0),
    materialFlags: ArxPolygonFlags.None,
  })
  const models = [pcGameBox].flat()
  models.forEach((mesh) => {
    mesh.translateX(map.config.offset.x)
    mesh.translateY(map.config.offset.y)
    mesh.translateZ(map.config.offset.z)
    applyTransformations(mesh)
    map.polygons.addThreeJsMesh(mesh, { tryToQuadify: DONT_QUADIFY, shading: SHADING_SMOOTH })
  })

  /*
  -------------------
  convert the obj file into evm_box.ftl -> scale it 10x
  place it into game/graph/obj3d/interactive/items/special/evm_box/
  rename texture to evm_box_art.png
  create script: graph/obj3d/interactive/items/special/evm_box/evm_box.asl
    noshadow
    setname <name of the pc game>
  create icon at graph/obj3d/interactive/items/special/evm_box/evm_box[icon].bmp

  -------------------
  */

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
