import fs from 'node:fs'
import path from 'node:path'
import { getCellCoords } from 'arx-level-json-converter/dist/common/helpers'
import { ArxPolygonFlags, MAP_DEPTH_IN_CELLS, MAP_WIDTH_IN_CELLS } from 'arx-level-json-converter/dist/common/constants'
import { times } from './faux-ramda'
import { Triangle } from 'three'
import { Vector3 } from './Vector3'
import { ArxLLF } from 'arx-level-json-converter/dist/llf/LLF'
import { NO_TEXTURE } from './constants'
import { getPackageVersion, uninstall } from './helpers'
import { ArxDLF } from 'arx-level-json-converter/dist/dlf/DLF'
import { ArxFTS } from 'arx-level-json-converter/dist/fts/FTS'
import { ArxVertexWithColor } from './types'
import { Vertex } from './Vertex'
import { transparent } from './Color'
import { ArxVertex } from 'arx-level-json-converter/dist/fts/Vertex'
import { Polygon } from './Polygon'
import { ArxColor } from 'arx-level-json-converter/dist/common/Color'

export class ArxMap {
  private dlf: ArxDLF
  private fts: ArxFTS
  private llf: ArxLLF
  private polygons: Polygon[]

  private constructor(dlf: ArxDLF, fts: ArxFTS, llf: ArxLLF, normalsCalculated = false) {
    this.dlf = dlf
    this.fts = fts
    this.llf = llf
    this.polygons = []

    this.deserializePolygons(normalsCalculated)
  }

  private deserializePolygons(normalsCalculated: boolean) {
    this.polygons = this.fts.polygons.map(({ vertices, norm, norm2, ...polygonData }): Polygon => {
      const extendedVertices = vertices.map(({ llfColorIdx, ...vertex }) => {
        const extendedVertex: ArxVertexWithColor = vertex
        if (typeof llfColorIdx === 'number') {
          extendedVertex.color = this.llf.colors[llfColorIdx]
        }
        return Vertex.fromArxVertex(extendedVertex)
      })

      return {
        ...polygonData,
        vertices: extendedVertices as [Vertex, Vertex, Vertex, Vertex],
        normalsCalculated,
        norm: Vector3.fromArxVector3(norm),
        norm2: Vector3.fromArxVector3(norm2),
      }
    })

    this.fts.polygons = []
    this.llf.colors = []
  }

  private serializePolygons() {
    this.polygons.forEach(({ vertices, norm, norm2, ...polygon }) => {
      const arxVertices = vertices.map((vertex) => {
        return vertex.toArxVertex()
      })

      this.fts.polygons.push({
        ...polygon,
        vertices: arxVertices as [ArxVertex, ArxVertex, ArxVertex, ArxVertex],
        norm: norm.toArxVector3(),
        norm2: norm.toArxVector3(),
      })
    })

    this.polygons = []
  }

  static async loadLevel(levelIdx: number) {
    const folder = path.resolve(__dirname, `../assets/levels/level${levelIdx}`)

    const rawDlf = await fs.promises.readFile(path.resolve(folder, `level${levelIdx}.dlf.json`), 'utf-8')
    const dlf = JSON.parse(rawDlf) as ArxDLF

    const rawFts = await fs.promises.readFile(path.resolve(folder, `fast.fts.json`), 'utf-8')
    const fts = JSON.parse(rawFts) as ArxFTS

    const rawLlf = await fs.promises.readFile(path.resolve(folder, `level${levelIdx}.llf.json`), 'utf-8')
    const llf = JSON.parse(rawLlf) as ArxLLF

    const now = Math.floor(Date.now() / 1000)
    const generatorId = await ArxMap.getGeneratorId()

    dlf.header.lastUser = generatorId
    dlf.header.time = now

    llf.header.lastUser = generatorId
    llf.header.time = now

    return new ArxMap(dlf, fts, llf, true)
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

    const fts: ArxFTS = {
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
    this.polygons.push({
      vertices: [
        new Vertex(0, 0, 0, 0, 0, transparent),
        new Vertex(1, 0, 0, 0, 1, transparent),
        new Vertex(0, 0, 1, 1, 0, transparent),
        new Vertex(1, 0, 1, 1, 1, transparent),
      ],
      normalsCalculated: false,
      tex: NO_TEXTURE,
      norm: new Vector3(),
      norm2: new Vector3(),
      transval: 0,
      area: 1,
      type: ArxPolygonFlags.Quad | ArxPolygonFlags.NoDraw,
      room: 1,
    })
  }

  finalize() {
    this.dlf.header.numberOfBackgroundPolygons = this.polygons.length
    this.llf.header.numberOfBackgroundPolygons = this.polygons.length

    this.calculateNormals()
    this.llf.colors = this.getVertexColors()
    this.serializePolygons()
  }

  getPlayerSpawn() {
    const posEdit = Vector3.fromArxVector3(this.dlf.header.posEdit)
    return Vector3.fromArxVector3(this.fts.sceneHeader.mScenePosition).add(posEdit)
  }

  setPlayerSpawn(playerSpawn: Vector3) {
    const posEdit = Vector3.fromArxVector3(this.dlf.header.posEdit)
    this.fts.sceneHeader.mScenePosition = playerSpawn.sub(posEdit).toArxVector3()
  }

  private calculateNormals() {
    this.polygons.forEach((polygon) => {
      if (polygon.normalsCalculated === true) {
        return
      }

      const isQuad = (polygon.type & ArxPolygonFlags.Quad) > 0
      const [a, b, c, d] = polygon.vertices

      const triangle = new Triangle(a, b, c)
      triangle.getNormal(polygon.norm)

      if (isQuad) {
        const triangle2 = new Triangle(d, b, c)
        triangle2.getNormal(polygon.norm2)
      }
    })
  }

  private getVertexColors() {
    const cells: Record<string, number[]> = {}

    this.polygons.forEach((polygon, idx) => {
      const vertices = polygon.vertices.map((vertex) => vertex.toArxVertex())
      const [cellX, cellZ] = getCellCoords(vertices as [ArxVertex, ArxVertex, ArxVertex, ArxVertex])
      const key = `${cellZ}--${cellX}`

      if (key in cells) {
        cells[key].push(idx)
      } else {
        cells[key] = [idx]
      }
    })

    const colors: ArxColor[] = []

    for (let z = 0; z < MAP_DEPTH_IN_CELLS; z++) {
      for (let x = 0; x < MAP_WIDTH_IN_CELLS; x++) {
        const cell = cells[`${z}--${x}`]
        if (cell) {
          cell.forEach((idx) => {
            const polygon = this.polygons[idx]
            const isQuad = (polygon.type & ArxPolygonFlags.Quad) > 0

            for (let i = 0; i < (isQuad ? 4 : 3); i++) {
              const color = polygon.vertices[i]?.color ?? transparent
              colors.push(color.toArxColor())
            }
          })
        }
      }
    }

    return colors
  }

  async saveToDisk(outputDir: string, levelIdx: number, prettify: boolean = false) {
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
