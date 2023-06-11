import path from 'node:path'
import { ArxPolygonFlags } from 'arx-convert/types'
import seedrandom from 'seedrandom'
import { Vector2 } from 'three'
import { ArxMap } from '@src/ArxMap.js'
import { DONT_QUADIFY, SHADING_SMOOTH } from '@src/Polygons.js'
import { Vector3 } from '@src/Vector3.js'
import { applyTransformations } from '@src/helpers.js'
import { loadOBJ } from '@tools/mesh/loadOBJ.js'

export default async () => {
  const {
    OUTPUTDIR = path.resolve('./dist'),
    LEVEL = '1',
    SEED = Math.floor(Math.random() * 1e20).toString(),
  } = process.env

  seedrandom(SEED, { global: true })
  console.log(`seed: ${SEED}`)

  const map = new ArxMap()
  map.meta.mapName = 'Union 1 Office'
  map.meta.seed = SEED
  map.config.offset = new Vector3(6000, 0, 6000)
  map.player.position.adjustToPlayerHeight()
  map.player.withScript()
  map.hud.hide('all')

  const level = await loadOBJ('projects/union-1-office/Office', {
    scaleUV: new Vector2(-1, -1),
    materialFlags: (texture) => {
      let flags = ArxPolygonFlags.None

      const tileableTextures = [
        'bark.jpg',
        'book2.jpg',
        'book4.jpg',
        'brass.jpg',
        'copper.jpg',
        'cream.jpg',
        'eraser.jpg',
        'fan-vent-grey.jpg',
        'floor.jpg',
        'glass.jpg',
        'green.jpg',
        'grey-archive.jpg',
        'mahogany.jpg',
        'mirror.jpg',
        'net.jpg',
        'pc-side.jpg',
        'phone-color.jpg',
        'shiny.jpg',
        'silver.jpg',
        'sockets.jpg',
        'sockets-utp.jpg',
        'soil.jpg',
        'stem.jpg',
        'walltexture.jpg',
        'wallwood.jpg',
        'yellow.jpg',
        'yellow-flower.jpg',
      ]
      if (tileableTextures.includes(texture.filename)) {
        flags |= ArxPolygonFlags.Tiled
      }

      const doubleSidedTextures = ['black-wood.jpg', 'cream.jpg', 'walltexture.jpg', 'wallwood.jpg']
      if (doubleSidedTextures.includes(texture.filename)) {
        flags |= ArxPolygonFlags.DoubleSided
      }

      const glowingTextures = ['glass.jpg', 'mirror.jpg']
      if (glowingTextures.includes(texture.filename)) {
        flags |= ArxPolygonFlags.Glow
      }

      if (texture.filename) return flags
    },
  })

  level.flat().forEach((mesh) => {
    applyTransformations(mesh)
    mesh.translateX(map.config.offset.x)
    mesh.translateY(map.config.offset.y)
    mesh.translateZ(map.config.offset.z)
    applyTransformations(mesh)
    map.polygons.addThreeJsMesh(mesh, { tryToQuadify: DONT_QUADIFY, shading: SHADING_SMOOTH })
  })

  map.finalize()
  map.saveToDisk(OUTPUTDIR, parseInt(LEVEL))
}
