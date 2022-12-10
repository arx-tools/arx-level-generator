import fs from 'node:fs'
import path from 'node:path'
import { ArxFTS } from 'arx-level-json-converter/dist/fts/FTS'
import { getCellCoords } from 'arx-level-json-converter/dist/common/helpers'
import { ArxPolygonFlags, MAP_DEPTH_IN_CELLS, MAP_WIDTH_IN_CELLS } from 'arx-level-json-converter/dist/common/constants'
import { times } from './faux-ramda'
import { Triangle } from 'three'
import { Vector3 } from './Vector3'
import { ArxLLF } from 'arx-level-json-converter/dist/llf/LLF'
import { NO_TEXTURE } from './constants'
import { getPackageVersion, uninstall } from './helpers'
import { ArxColor } from 'arx-level-json-converter/dist/common/Color'
import { ArxDLF } from 'arx-level-json-converter/dist/dlf/DLF'
import { ArxVector3 } from 'arx-level-json-converter/dist/types'
import { ArxPolygon } from 'arx-level-json-converter/dist/fts/Polygon'
import { ArxVertex } from 'arx-level-json-converter/dist/fts/Vertex'

type ExtendedArxVertex = ArxVertex & {
  color?: ArxColor
}

type ExtendedArxPolygon = Omit<ArxPolygon, 'vertices'> & {
  vertices: [ExtendedArxVertex, ExtendedArxVertex, ExtendedArxVertex, ExtendedArxVertex]
  normalsCalculated?: boolean
}

type ExtendedArxFTS = Omit<ArxFTS, 'polygons'> & {
  polygons: ExtendedArxPolygon[]
}

// ....
;(async () => {
  const { OUTPUTDIR = path.resolve('./dist'), LEVEL = '1' } = process.env

  const now = Math.floor(Date.now() / 1000)
  const generatorId = `Arx Level Generator - version ${await getPackageVersion()}`

  // -------------------
  // load existing level

  const rawDlf = await fs.promises.readFile(path.resolve(__dirname, '../assets/levels/level1/level1.dlf.json'), 'utf-8')
  const dlf = JSON.parse(rawDlf) as ArxDLF

  const rawFts = await fs.promises.readFile(path.resolve(__dirname, '../assets/levels/level1/fast.fts.json'), 'utf-8')
  const fts = JSON.parse(rawFts) as ExtendedArxFTS

  const rawLlf = await fs.promises.readFile(path.resolve(__dirname, '../assets/levels/level1/level1.llf.json'), 'utf-8')
  const llf = JSON.parse(rawLlf) as ArxLLF

  // -------------------
  // reset stuff in loaded level

  dlf.header.lastUser = generatorId
  dlf.header.time = now

  fts.polygons.forEach((polygon) => {
    polygon.normalsCalculated = true
    polygon.vertices.forEach((vertex) => {
      if (typeof vertex.llfColorIdx === 'number') {
        vertex.color = llf.colors[vertex.llfColorIdx]
        delete vertex.llfColorIdx
      }
    })
  })

  llf.header.lastUser = generatorId
  llf.header.time = now

  llf.colors = []

  /*
  // -------------------
  // generate blank level

  const dlf: ArxDLF = {
    header: {
      lastUser: generatorId,
      time: now,
      posEdit: { x: 0, y: 0, z: 0 },
      angleEdit: { a: 0, b: 0, g: 0 },
      numberOfNodes: 0,
      numberOfNodeLinks: 0,
      numberOfZones: 0,
      numberOfBackgroundPolygons: 0,
      numberOfIgnoredPolygons: 0,
      numberOfChildPolygons: 0,
      offset: { x: 0, y: 0, z: 0 },
    },
    scene: {
      levelIdx: parseInt(LEVEL),
    },
    interactiveObjects: [],
    lights: [],
    fogs: [],
    paths: [],
  }

  const fts: ArxFTS = {
    header: {
      levelIdx: parseInt(LEVEL),
    },
    uniqueHeaders: [],
    sceneHeader: {
      playerPosition: { x: 0, y: 0, z: 0 },
      mScenePosition: { x: 0, y: 0, z: 0 },
    },
    textureContainers: [],
    cells: times(() => ({}), 160 * 160),
    polygons: [],
    anchors: [],
    portals: [],
    rooms: [
      { portals: [], polygons: [] },
      { portals: [], polygons: [] },
    ],
    roomDistances: [
      {
        distance: -1,
        startPosition: { x: 0, y: 0, z: 0 },
        endPosition: { x: 1, y: 0, z: 0 },
      },
      {
        distance: -1,
        startPosition: { x: 0, y: 0, z: 0 },
        endPosition: { x: 0, y: 1, z: 0 },
      },
      {
        distance: -1,
        startPosition: { x: 0.984375, y: 0.984375, z: 0 },
        endPosition: { x: 0, y: 0, z: 0 },
      },
      {
        distance: -1,
        startPosition: { x: 0, y: 0, z: 0 },
        endPosition: { x: 0, y: 0, z: 0 },
      },
    ],
  }

  const llf: ArxLLF = {
    header: {
      lastUser: generatorId,
      time: now,
      numberOfShadowPolygons: 0,
      numberOfIgnoredPolygons: 0,
      numberOfBackgroundPolygons: 0,
    },
    lights: [],
    colors: [],
  }

  // -------------------
  // addOriginPolygon

  fts.polygons.push({
    vertices: [
      { x: 0, y: 0, z: 0, u: 0, v: 0 },
      { x: 1, y: 0, z: 0, u: 0, v: 1 },
      { x: 0, y: 0, z: 1, u: 1, v: 0 },
      { x: 1, y: 0, z: 1, u: 1, v: 1 },
    ],
    tex: NO_TEXTURE,
    norm: { x: 0, y: 0, z: 0 },
    norm2: { x: 0, y: 0, z: 0 },
    transval: 0,
    area: 1,
    type: ArxPolygonFlags.Quad | ArxPolygonFlags.NoDraw,
    room: 1,
  })
  */

  // -------------------
  // adding stuff to the level

  // TODO

  // -------------------
  // finalize

  dlf.header.numberOfBackgroundPolygons = fts.polygons.length
  llf.header.numberOfBackgroundPolygons = fts.polygons.length

  // const playerSpawn: ArxVector3 = { x: 6000, y: -140, z: 6000 }
  // fts.sceneHeader.mScenePosition = playerSpawn

  // -------------------
  // calculateNormals

  fts.polygons.forEach((polygon) => {
    if (polygon?.normalsCalculated === true) {
      return
    }

    const [a, b, c, d] = polygon.vertices
    const isQuad = (polygon.type & ArxPolygonFlags.Quad) > 0

    const norm = new Vector3(0, 0, 0)
    const triangle = new Triangle(new Vector3(a.x, a.y, a.z), new Vector3(b.x, b.y, b.z), new Vector3(c.x, c.y, c.z))
    triangle.getNormal(norm)

    const norm2 = new Vector3(0, 0, 0)
    if (isQuad) {
      const triangle2 = new Triangle(new Vector3(d.x, d.y, d.z), new Vector3(b.x, b.y, b.z), new Vector3(c.x, c.y, c.z))
      triangle2.getNormal(norm2)
    }

    polygon.norm = norm.toArxVector3()
    polygon.norm2 = norm2.toArxVector3()
  })

  // -------------------
  // genereateLight

  let colorIdx = 0

  const cells: Record<string, number[]> = {}

  fts.polygons.forEach((polygon, idx) => {
    const [cellX, cellZ] = getCellCoords(polygon.vertices)
    const key = `${cellZ}--${cellX}`

    if (key in cells) {
      cells[key].push(idx)
    } else {
      cells[key] = [idx]
    }
  })

  for (let z = 0; z < MAP_DEPTH_IN_CELLS; z++) {
    for (let x = 0; x < MAP_WIDTH_IN_CELLS; x++) {
      const cell = cells[`${z}--${x}`]
      if (cell) {
        cell.forEach((idx) => {
          const polygon = fts.polygons[idx]
          const isQuad = (polygon.type & ArxPolygonFlags.Quad) > 0
          const fallbackColor: ArxColor = { r: 255, g: 255, b: 255, a: 1 }

          llf.colors.push(
            polygon.vertices[0]?.color ?? fallbackColor,
            polygon.vertices[1]?.color ?? fallbackColor,
            polygon.vertices[2]?.color ?? fallbackColor,
          )
          polygon.vertices[0].llfColorIdx = colorIdx++
          polygon.vertices[1].llfColorIdx = colorIdx++
          polygon.vertices[2].llfColorIdx = colorIdx++

          if (isQuad) {
            llf.colors.push(polygon.vertices[3]?.color ?? fallbackColor)
            polygon.vertices[3].llfColorIdx = colorIdx++
          }
        })
      }
    }
  }

  // -------------------
  // saveToDisk

  const defaultOutputDir = path.resolve('./dist')

  console.log('output directory:', OUTPUTDIR)

  if (OUTPUTDIR === defaultOutputDir) {
    try {
      await fs.promises.rm('dist', { recursive: true })
    } catch (e) {}
  } else {
    await uninstall(OUTPUTDIR)
  }

  const files = {
    dlf: `${OUTPUTDIR}graph/levels/level${LEVEL}/level${LEVEL}.dlf.json`,
    fts: `${OUTPUTDIR}game/graph/levels/level${LEVEL}/fast.fts.json`,
    llf: `${OUTPUTDIR}graph/levels/level${LEVEL}/level${LEVEL}.llf.json`,
  }

  const manifest = {
    files: [
      files.dlf.replace('.dlf.json', '.dlf'),
      files.fts.replace('.fts.json', '.fts'),
      files.llf.replace('.llf.json', '.llf'),
    ],
  }

  const tasks = manifest.files.map((filename) => {
    return fs.promises.mkdir(path.dirname(filename), { recursive: true })
  })

  for (let task of tasks) {
    await task
  }

  await fs.promises.writeFile(files.dlf, JSON.stringify(dlf, null, 2))
  await fs.promises.writeFile(files.fts, JSON.stringify(fts, null, 2))
  await fs.promises.writeFile(files.llf, JSON.stringify(llf, null, 2))

  await fs.promises.writeFile(`${OUTPUTDIR}arx-level-generator-manifest.json`, JSON.stringify(manifest, null, 2))
})()
