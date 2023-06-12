import path from 'node:path'
import { ArxPolygonFlags } from 'arx-convert/types'
import seedrandom from 'seedrandom'
import { Vector2 } from 'three'
import { ArxMap } from '@src/ArxMap.js'
import { DONT_QUADIFY, SHADING_SMOOTH } from '@src/Polygons.js'
import { Vector3 } from '@src/Vector3.js'
import { applyTransformations } from '@src/helpers.js'
import { createLight } from '@tools/createLight.js'
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
    scaleUV: (texture) => {
      const nonTiledTextures = [
        'buttons.jpg',
        'calendar.jpg',
        'discord-banner.jpg',
        'keyboard.jpg',
        'pc-back.jpg',
        'pc-front.jpg',
        'picture1.jpg',
        'picture2.jpg',
        'picture3.jpg',
        'picture4.jpg',
        'picture5.jpg',
        'winxpdesk.jpg',
      ]
      if (nonTiledTextures.includes(texture.filename)) {
        return new Vector2(1, 1)
      }

      return new Vector2(-1, -1)
    },
    materialFlags: (texture) => {
      let flags = ArxPolygonFlags.None | ArxPolygonFlags.NoShadow

      const nonTiledTextures = [
        'buttons.jpg',
        'calendar.jpg',
        'discord-banner.jpg',
        'keyboard.jpg',
        'pc-back.jpg',
        'pc-front.jpg',
        'picture1.jpg',
        'picture2.jpg',
        'picture3.jpg',
        'picture4.jpg',
        'picture5.jpg',
        'winxpdesk.jpg',
      ]
      if (!nonTiledTextures.includes(texture.filename)) {
        flags |= ArxPolygonFlags.Tiled
      }

      const doubleSidedTextures = [
        'black-wood.jpg',
        'cream.jpg',
        'walltexture.jpg',
        'wallwood.jpg',
        'window.bmp',
        'mahogany.jpg',
      ]
      if (doubleSidedTextures.includes(texture.filename)) {
        flags |= ArxPolygonFlags.DoubleSided
      }

      const glowingTextures = ['glass.jpg', 'mirror.jpg']
      if (glowingTextures.includes(texture.filename)) {
        flags |= ArxPolygonFlags.Glow
      }

      return flags
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

  const mainLight = createLight({
    position: new Vector3(0, -200, 0),
    radius: 2000,
  })
  map.lights.push(mainLight)

  // TODO: ask Fredlllll about double sided faces

  map.finalize()
  map.saveToDisk(OUTPUTDIR, parseInt(LEVEL))
}
