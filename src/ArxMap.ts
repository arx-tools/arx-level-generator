import fs from 'node:fs'
import path from 'node:path'
import { getCellCoords, MAP_DEPTH_IN_CELLS, MAP_WIDTH_IN_CELLS, QuadrupleOf } from 'arx-convert/utils'
import { ArxColor, ArxDLF, ArxFTS, ArxLLF, ArxPolygonFlags, ArxVertex } from 'arx-convert/types'
import { times } from './faux-ramda'
import { Vector3 } from './Vector3'
import { NO_TEXTURE } from './constants'
import { getPackageVersion, uninstall } from './helpers'
import { Vertex } from './Vertex'
import { transparent } from './Color'
import { Polygon } from './Polygon'
import { OriginalLevel } from './types'
import { LevelLoader } from './LevelLoader'
import { MapFinalizedError, MapNotFinalizedError } from './errors'
import { Light } from './Light'

export class ArxMap {
  dlf: ArxDLF
  fts: ArxFTS
  llf: ArxLLF
  polygons: Polygon[] = []
  lights: Light[] = []
  fogs: any[] = []
  entities: any[] = []
  zones: any[] = []
  paths: any[] = []
  config: {
    isFinalized: boolean
  }

  private constructor(dlf: ArxDLF, fts: ArxFTS, llf: ArxLLF, normalsCalculated = false) {
    this.dlf = dlf
    this.fts = fts
    this.llf = llf

    this.config = {
      isFinalized: false,
    }

    this.deserializeArxData(normalsCalculated)
  }

  private deserializeArxData(normalsCalculated: boolean) {
    this.polygons = this.fts.polygons.map((polygon) => {
      return Polygon.fromArxPolygon(polygon, this.llf.colors, normalsCalculated)
    })

    this.fts.polygons = []
    this.llf.colors = []
  }

  private serializePolygons() {
    this.fts.polygons = this.polygons.map((polygon) => {
      return polygon.toArxPolygon()
    })

    this.polygons = []
  }

  static async loadLevel(levelIdx: OriginalLevel) {
    const loader = new LevelLoader(levelIdx)

    const dlf = await loader.readDlf()
    const fts = await loader.readFts()
    const llf = await loader.readLlf()

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
        numberOfBackgroundPolygons: 0,
      },
      scene: {
        levelIdx: 1,
      },
      interactiveObjects: [],
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
      cells: times(() => ({}), MAP_DEPTH_IN_CELLS * MAP_WIDTH_IN_CELLS),
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
    this.polygons.push(
      new Polygon({
        vertices: [
          new Vertex(0, 0, 0, 0, 0, transparent),
          new Vertex(1, 0, 0, 0, 1, transparent),
          new Vertex(0, 0, 1, 1, 0, transparent),
          new Vertex(1, 0, 1, 1, 1, transparent),
        ],
        norm: new Vector3(),
        norm2: new Vector3(),
        normalsCalculated: false,
        polygonData: {
          textureContainerId: NO_TEXTURE,
          transval: 0,
          area: 1,
          flags: ArxPolygonFlags.Quad | ArxPolygonFlags.NoDraw,
          room: 1,
        },
      }),
    )
  }

  finalize() {
    if (this.config.isFinalized) {
      throw new MapFinalizedError()
    }

    this.config.isFinalized = true

    this.dlf.header.numberOfBackgroundPolygons = this.polygons.length
    this.llf.header.numberOfBackgroundPolygons = this.polygons.length

    this.calculateNormals()
    this.llf.colors = this.getVertexColors()

    this.calculateRoomData()

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
      polygon.calculateNormals()
    })
  }

  private getVertexColors() {
    const cells: Record<string, number[]> = {}

    this.polygons.forEach((polygon, idx) => {
      const vertices = polygon.vertices.map((vertex) => vertex.toArxVertex())
      const [cellX, cellZ] = getCellCoords(vertices as QuadrupleOf<ArxVertex>)
      const key = `${cellZ}|${cellX}`

      if (key in cells) {
        cells[key].push(idx)
      } else {
        cells[key] = [idx]
      }
    })

    const colors: ArxColor[] = []

    for (let z = 0; z < MAP_DEPTH_IN_CELLS; z++) {
      for (let x = 0; x < MAP_WIDTH_IN_CELLS; x++) {
        const cell = cells[`${z}|${x}`] as number[] | undefined
        if (typeof cell === 'undefined') {
          continue
        }

        cell.forEach((idx) => {
          const polygon = this.polygons[idx]

          for (let i = 0; i < (polygon.isQuad() ? 4 : 3); i++) {
            const color = polygon.vertices[i]?.color ?? transparent
            colors.push(color.toArxColor())
          }
        })
      }
    }

    return colors
  }

  removePortals() {
    if (this.config.isFinalized) {
      throw new MapFinalizedError()
    }

    this.fts.portals = []

    this.fts.rooms.forEach((room) => {
      room.portals = []
    })

    this.movePolygonsToSameRoom()
  }

  private movePolygonsToSameRoom() {
    this.polygons.forEach((polygon) => {
      if (polygon.polygonData.room < 1) {
        return
      }

      polygon.polygonData.room = 1
    })

    this.fts.rooms = this.fts.rooms.slice(0, 2)

    this.fts.roomDistances = [
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
    ]
  }

  private calculateRoomData = () => {
    this.fts.rooms.forEach((room) => {
      room.polygons = []
    })

    const polygonsPerCellCounter: Record<string, number> = {}

    this.polygons.forEach((polygon) => {
      const { room } = polygon.polygonData
      if (room < 1) {
        return
      }

      const vertices = polygon.vertices.map((vertex) => vertex.toArxVertex())
      const [cellX, cellY] = getCellCoords(vertices as [ArxVertex, ArxVertex, ArxVertex, ArxVertex])

      const key = `${cellX}|${cellY}`
      if (key in polygonsPerCellCounter) {
        polygonsPerCellCounter[key] += 1
      } else {
        polygonsPerCellCounter[key] = 0
      }

      this.fts.rooms[room].polygons.push({ cellX, cellY, polygonIdx: polygonsPerCellCounter[key] })
    })
  }

  setLevelIdx(levelIdx: number) {
    this.dlf.scene.levelIdx = levelIdx
    this.fts.header.levelIdx = levelIdx
  }

  async saveToDisk(outputDir: string, levelIdx: number, prettify: boolean = false) {
    if (!this.config.isFinalized) {
      throw new MapNotFinalizedError()
    }

    this.setLevelIdx(levelIdx)

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

  alignPolygonsTo(map: ArxMap) {
    const offset = Vector3.fromArxVector3(map.fts.sceneHeader.mScenePosition).sub(
      Vector3.fromArxVector3(this.fts.sceneHeader.mScenePosition),
    )
    this.movePolygons(offset)
  }

  movePolygons(offset: Vector3) {
    if (this.config.isFinalized) {
      throw new MapFinalizedError()
    }

    this.polygons.forEach((polygon) => {
      polygon.vertices.forEach((vertex) => {
        vertex.add(offset)
      })
    })
  }

  moveEntities(offset: Vector3) {
    if (this.config.isFinalized) {
      throw new MapFinalizedError()
    }

    // lights
    this.llf.lights.forEach((light) => {
      light.pos.x += offset.x
      light.pos.y += offset.y
      light.pos.z += offset.z
    })

    // fogs
    this.dlf.fogs.forEach((fog) => {
      fog.pos.x += offset.x
      fog.pos.y += offset.y
      fog.pos.z += offset.z
    })

    // entities
    this.dlf.interactiveObjects.forEach((obj) => {
      obj.pos.x += offset.x
      obj.pos.y += offset.y
      obj.pos.z += offset.z
    })

    // zones
    this.dlf.paths.forEach((zone) => {
      zone.header.pos.x += offset.x
      zone.header.pos.y += offset.y
      zone.header.pos.z += offset.z
    })

    // paths
    this.fts.anchors.forEach((anchor) => {
      anchor.data.pos.x += offset.x
      anchor.data.pos.y += offset.y
      anchor.data.pos.z += offset.z
    })
  }

  move(offset: Vector3) {
    this.movePolygons(offset)
    this.moveEntities(offset)
  }

  add(map: ArxMap) {
    if (this.config.isFinalized) {
      throw new MapFinalizedError()
    }

    // polygons
    map.polygons.forEach((polygon) => {
      this.polygons.push(polygon)
    })

    // lights
    map.llf.lights.forEach((light) => {
      this.llf.lights.push(light)
    })

    // fogs
    map.dlf.fogs.forEach((fog) => {
      this.dlf.fogs.push(fog)
    })

    // entities
    map.dlf.interactiveObjects.forEach((obj) => {
      this.dlf.interactiveObjects.push(obj)
    })

    // zones
    map.dlf.paths.forEach((zone) => {
      this.dlf.paths.push(zone)
    })

    // paths
    // map.fts.anchors.forEach((anchor) => {
    //   this.fts.anchors.push(anchor)
    // })

    // TODO: adjust fts anchor linked anchor indices

    // TODO: adjust fts polygon texture container ids
  }
}
