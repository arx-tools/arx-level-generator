import fs from 'node:fs'
import path from 'node:path'
import { getCellCoords } from 'arx-level-json-converter/dist/common/helpers'
import { ArxPolygonFlags, MAP_DEPTH_IN_CELLS, MAP_WIDTH_IN_CELLS } from 'arx-level-json-converter/dist/common/constants'
import { max, min, times } from './faux-ramda'
import { Triangle } from 'three'
import { Vector3 } from './Vector3'
import { ArxLLF } from 'arx-level-json-converter/dist/llf/LLF'
import { NO_TEXTURE } from './constants'
import { getPackageVersion, uninstall } from './helpers'
import { ArxColor } from 'arx-level-json-converter/dist/common/Color'
import { ArxDLF } from 'arx-level-json-converter/dist/dlf/DLF'
import { ExtendedArxFTS } from './types'
import { ArxVector3 } from 'arx-level-json-converter/dist/types'

export class ArxMap {
  private dlf: ArxDLF
  private fts: ExtendedArxFTS
  private llf: ArxLLF
  private playerSpawn: Vector3

  private constructor(dlf: ArxDLF, fts: ExtendedArxFTS, llf: ArxLLF) {
    this.dlf = dlf
    this.fts = fts
    this.llf = llf
    this.playerSpawn = new Vector3(0, 0, 0)
  }

  static async loadLevel(levelIdx: number) {
    const folder = path.resolve(__dirname, `../assets/levels/level${levelIdx}`)

    const rawDlf = await fs.promises.readFile(path.resolve(folder, `level${levelIdx}.dlf.json`), 'utf-8')
    const dlf = JSON.parse(rawDlf) as ArxDLF

    const rawFts = await fs.promises.readFile(path.resolve(folder, `fast.fts.json`), 'utf-8')
    const fts = JSON.parse(rawFts) as ExtendedArxFTS

    const rawLlf = await fs.promises.readFile(path.resolve(folder, `level${levelIdx}.llf.json`), 'utf-8')
    const llf = JSON.parse(rawLlf) as ArxLLF

    const map = new this(dlf, fts, llf)

    await map.cleanupLoadedLevel()

    return map
  }

  private async cleanupLoadedLevel() {
    const now = Math.floor(Date.now() / 1000)
    const generatorId = await ArxMap.getGeneratorId()

    this.dlf.header.lastUser = generatorId
    this.dlf.header.time = now

    this.fts.polygons.forEach((polygon) => {
      polygon.normalsCalculated = true
      polygon.vertices.forEach((vertex) => {
        if (typeof vertex.llfColorIdx === 'number') {
          vertex.color = this.llf.colors[vertex.llfColorIdx]
          delete vertex.llfColorIdx
        }
      })
    })

    this.llf.header.lastUser = generatorId
    this.llf.header.time = now
    this.llf.colors = []

    const xs = this.fts.polygons.flatMap(({ vertices }) => vertices).flatMap(({ x }) => x)
    const zs = this.fts.polygons.flatMap(({ vertices }) => vertices).flatMap(({ z }) => z)

    // max(xs) = 13650.30078125
    // max(zs) = 12150.646484375
    console.log(max(xs) / 2, '/', max(zs) / 2) // 6825.150390625 / 6075.3232421875

    console.log(this.fts.sceneHeader.mScenePosition) // { x: 16250, y: 3105.0791015625, z: 5550 }
    console.log(this.fts.sceneHeader.playerPosition) // { x: 8650, y: 3105.0791015625, z: 8550 }
    console.log(this.dlf.header.posEdit) // { x: -8072.8330078125, y: -267.7666015625, z: 3806.7236328125 }
    console.log(this.dlf.header.offset) // { x: 0, y: 0, z: 0 }

    // mScenePosition + posEdit = 8177.17 / 2837.37 / 9356.72

    // actual center ~= 9259.16 / 2928.28 / 6772.25

    // mini offset for level1 = 1 / 10
  }

  private static async getGeneratorId() {
    return `Arx Level Generator - version ${await getPackageVersion()}`
  }

  static async createBlankMap() {
    const now = Math.floor(Date.now() / 1000)
    const generatorId = await ArxMap.getGeneratorId()

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
        levelIdx: 1,
      },
      interactiveObjects: [],
      lights: [],
      fogs: [],
      paths: [],
    }

    const fts: ExtendedArxFTS = {
      header: {
        levelIdx: 1,
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

    const map = new ArxMap(dlf, fts, llf)

    map.alignMinimapWithPolygons()

    return map
  }

  private alignMinimapWithPolygons() {
    const transparent: ArxColor = { r: 0, g: 0, b: 0, a: 0 }

    const mapWidth = 13333
    const mapHeight = 11166

    // this.dlf.header.posEdit = { x: mapWidth / 2, y: 0, z: mapHeight / 2 }

    // this.fts.polygons.push({
    //   vertices: [
    //     { x: mapWidth, y: 0, z: mapHeight, u: 0, v: 0, color: transparent },
    //     { x: mapWidth + 1, y: 0, z: mapHeight, u: 0, v: 1, color: transparent },
    //     { x: mapWidth, y: 0, z: mapHeight + 1, u: 1, v: 0, color: transparent },
    //     { x: mapWidth + 1, y: 0, z: mapHeight + 1, u: 1, v: 1, color: transparent },
    //   ],
    //   tex: NO_TEXTURE,
    //   norm: { x: 0, y: 0, z: 0 },
    //   norm2: { x: 0, y: 0, z: 0 },
    //   transval: 0,
    //   area: 1,
    //   type: ArxPolygonFlags.Quad | ArxPolygonFlags.NoDraw,
    //   room: 1,
    // })

    this.fts.polygons.push({
      vertices: [
        { x: 0, y: 0, z: 0, u: 0, v: 0, color: transparent },
        { x: 1, y: 0, z: 0, u: 0, v: 1, color: transparent },
        { x: 0, y: 0, z: 1, u: 1, v: 0, color: transparent },
        { x: 1, y: 0, z: 1, u: 1, v: 1, color: transparent },
      ],
      tex: NO_TEXTURE,
      norm: { x: 0, y: 0, z: 0 },
      norm2: { x: 0, y: 0, z: 0 },
      transval: 0,
      area: 1,
      type: ArxPolygonFlags.Quad | ArxPolygonFlags.NoDraw,
      room: 1,
    })
  }

  public finalize() {
    this.dlf.header.numberOfBackgroundPolygons = this.fts.polygons.length
    this.llf.header.numberOfBackgroundPolygons = this.fts.polygons.length
  }

  public getPlayerSpawn() {
    const posEdit = Vector3.fromArxVector3(this.dlf.header.posEdit)
    return Vector3.fromArxVector3(this.fts.sceneHeader.mScenePosition).add(posEdit)
  }

  public setPlayerSpawn(playerSpawn: Vector3) {
    const posEdit = Vector3.fromArxVector3(this.dlf.header.posEdit)
    this.fts.sceneHeader.mScenePosition = playerSpawn.sub(posEdit).toArxVector3()
  }

  public calculateNormals() {
    this.fts.polygons.forEach((polygon) => {
      if (polygon?.normalsCalculated === true) {
        return
      }

      const [a, b, c, d] = polygon.vertices
      const isQuad = (polygon.type & ArxPolygonFlags.Quad) > 0
      const aVector = new Vector3(a.x, a.y, a.z)
      const bVector = new Vector3(b.x, b.y, b.z)
      const cVector = new Vector3(c.x, c.y, c.z)
      const dVector = new Vector3(d.x, d.y, d.z)

      const norm = new Vector3(0, 0, 0)
      const triangle = new Triangle(aVector, bVector, cVector)
      triangle.getNormal(norm)

      const norm2 = new Vector3(0, 0, 0)
      if (isQuad) {
        const triangle2 = new Triangle(dVector, bVector, cVector)
        triangle2.getNormal(norm2)
      }

      polygon.norm = norm.toArxVector3()
      polygon.norm2 = norm2.toArxVector3()
    })
  }

  public generateLights() {
    const cells: Record<string, number[]> = {}

    this.fts.polygons.forEach((polygon, idx) => {
      const [cellX, cellZ] = getCellCoords(polygon.vertices)
      const key = `${cellZ}--${cellX}`

      if (key in cells) {
        cells[key].push(idx)
      } else {
        cells[key] = [idx]
      }
    })

    let colorIdx = 0
    const fallbackColor: ArxColor = { r: 255, g: 255, b: 255, a: 1 }

    for (let z = 0; z < MAP_DEPTH_IN_CELLS; z++) {
      for (let x = 0; x < MAP_WIDTH_IN_CELLS; x++) {
        const cell = cells[`${z}--${x}`]
        if (cell) {
          cell.forEach((idx) => {
            const polygon = this.fts.polygons[idx]
            const isQuad = (polygon.type & ArxPolygonFlags.Quad) > 0

            for (let i = 0; i < (isQuad ? 4 : 3); i++) {
              this.llf.colors.push(polygon.vertices[i]?.color ?? fallbackColor)
              polygon.vertices[i].llfColorIdx = colorIdx++
            }
          })
        }
      }
    }
  }

  public async saveToDisk(outputDir: string, levelIdx: number, prettify: boolean = false) {
    const defaultOutputDir = path.resolve('./dist')

    console.log('output directory:', outputDir)

    if (outputDir === defaultOutputDir) {
      try {
        await fs.promises.rm('dist', { recursive: true })
      } catch (e) {}
    } else {
      await uninstall(outputDir)
    }

    const files = {
      dlf: `${outputDir}graph/levels/level${levelIdx}/level${levelIdx}.dlf.json`,
      fts: `${outputDir}game/graph/levels/level${levelIdx}/fast.fts.json`,
      llf: `${outputDir}graph/levels/level${levelIdx}/level${levelIdx}.llf.json`,
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

    const dlf = prettify ? JSON.stringify(this.dlf, null, 2) : JSON.stringify(this.dlf)
    const fts = prettify ? JSON.stringify(this.fts, null, 2) : JSON.stringify(this.fts)
    const llf = prettify ? JSON.stringify(this.llf, null, 2) : JSON.stringify(this.llf)

    await fs.promises.writeFile(files.dlf, dlf)
    await fs.promises.writeFile(files.fts, fts)
    await fs.promises.writeFile(files.llf, llf)

    await fs.promises.writeFile(`${outputDir}arx-level-generator-manifest.json`, JSON.stringify(manifest, null, 2))
  }
}
