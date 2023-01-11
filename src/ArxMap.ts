import fs from 'node:fs'
import path from 'node:path'
import { getCellCoords, MAP_DEPTH_IN_CELLS, MAP_WIDTH_IN_CELLS, QuadrupleOf } from 'arx-convert/utils'
import {
  ArxAnchor,
  ArxCell,
  ArxColor,
  ArxDLF,
  ArxFTS,
  ArxLLF,
  ArxRoom,
  ArxRoomDistance,
  ArxUniqueHeader,
  ArxVertex,
} from 'arx-convert/types'
import { times } from '@src/faux-ramda'
import { Vector3 } from '@src/Vector3'
import { getPackageVersion, uninstall } from '@src/helpers'
import { Color } from '@src/Color'
import { Polygon } from '@src/Polygon'
import { OriginalLevel } from '@src/types'
import { LevelLoader } from '@src/LevelLoader'
import { MapFinalizedError, MapNotFinalizedError } from '@src/errors'
import { Light } from '@src/Light'
import { Player } from '@src/Player'
import { Rotation } from '@src/Rotation'
import { Entity } from '@src/Entity'
import { Fog } from '@src/Fog'
import { Zone } from '@src/Zone'
import { Portal } from '@src/Portal'
import { Path } from '@src/Path'
import { Object3D } from 'three'
import { DONT_QUADIFY, Polygons, QUADIFY } from '@src/Polygons'
import { Entities } from '@src/Entities'
import { Lights } from '@src/Lights'

type ArxMapConfig = {
  isFinalized: boolean
  isMinimapVisible: boolean
  offset: Vector3
}

type ToBeSortedLater = {
  uniqueHeaders: ArxUniqueHeader[]
  cells: Omit<ArxCell, 'polygons'>[]
  anchors: ArxAnchor[]
  rooms: ArxRoom[]
  roomDistances: ArxRoomDistance[]
}

export class ArxMap {
  polygons = new Polygons()
  lights = new Lights()
  fogs: Fog[] = []
  entities = new Entities()
  zones: Zone[] = []
  paths: Path[] = []
  player: Player = new Player()
  portals: Portal[] = []
  config: ArxMapConfig = {
    isFinalized: false,
    isMinimapVisible: true,
    offset: new Vector3(0, 0, 0),
  }
  todo: ToBeSortedLater = {
    uniqueHeaders: [],
    cells: times(() => ({}), MAP_DEPTH_IN_CELLS * MAP_WIDTH_IN_CELLS),
    anchors: [],
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

  constructor(dlf?: ArxDLF, fts?: ArxFTS, llf?: ArxLLF, areNormalsCalculated = false) {
    if (typeof dlf === 'undefined' || typeof fts === 'undefined' || typeof llf === 'undefined') {
      return
    }

    this.player.orientation = Rotation.fromArxRotation(dlf.header.angleEdit)
    this.player.position = Vector3.fromArxVector3(dlf.header.posEdit)

    dlf.interactiveObjects.forEach((entity) => {
      this.entities.push(Entity.fromArxInteractiveObject(entity))
    })

    this.fogs = dlf.fogs.map(Fog.fromArxFog)
    this.zones = dlf.zones.map(Zone.fromArxZone)
    this.paths = dlf.paths.map(Path.fromArxPath)

    fts.polygons.forEach((polygon) => {
      this.polygons.push(Polygon.fromArxPolygon(polygon, llf.colors, fts.textureContainers, areNormalsCalculated))
    })

    this.portals = fts.portals.map(Portal.fromArxPortal)
    llf.lights.forEach((light) => {
      this.lights.push(Light.fromArxLight(light))
    })

    // TODO: deal with these stuff later
    this.todo.uniqueHeaders = fts.uniqueHeaders
    this.config.offset = Vector3.fromArxVector3(fts.sceneHeader.mScenePosition)
    this.todo.cells = fts.cells
    this.todo.anchors = fts.anchors
    this.todo.rooms = fts.rooms
    this.todo.roomDistances = fts.roomDistances
  }

  private async toArxData(levelIdx: number) {
    const now = Math.floor(Date.now() / 1000)
    const generatorId = await ArxMap.getGeneratorId()

    const dlf: ArxDLF = {
      header: {
        lastUser: generatorId,
        time: now,
        posEdit: this.player.position.toArxVector3(),
        angleEdit: this.player.orientation.toArxRotation(),
        numberOfBackgroundPolygons: this.polygons.length,
      },
      scene: {
        levelIdx,
      },
      fogs: this.fogs.map((fog) => {
        return fog.toArxFog()
      }),
      paths: this.paths.map((path) => {
        return path.toArxPath()
      }),
      zones: this.zones.map((zone) => {
        return zone.toArxZone()
      }),
      ...this.entities.toArxData(),
    }

    const fts: ArxFTS = {
      header: {
        levelIdx,
      },
      uniqueHeaders: this.todo.uniqueHeaders,
      sceneHeader: {
        mScenePosition: this.config.offset.toArxVector3(),
      },
      cells: this.todo.cells,
      anchors: this.todo.anchors,
      portals: this.portals.map((portal) => {
        return portal.toArxPortal()
      }),
      rooms: this.todo.rooms,
      roomDistances: this.todo.roomDistances,
      ...this.polygons.toArxData(),
    }

    const llf: ArxLLF = {
      header: {
        lastUser: generatorId,
        time: now,
        numberOfBackgroundPolygons: this.polygons.length,
      },
      colors: this.getVertexColors(),
      ...this.lights.toArxData(),
    }

    return {
      dlf,
      fts,
      llf,
    }
  }

  /**
   * Loads one of the levels found in the original game
   *
   * Requires the pkware-test-files repo
   * @see https://github.com/meszaros-lajos-gyorgy/pkware-test-files
   */
  static async fromOriginalLevel(levelIdx: OriginalLevel) {
    const loader = new LevelLoader(levelIdx)

    const dlf = await loader.readDlf()
    const fts = await loader.readFts()
    const llf = await loader.readLlf()

    return new ArxMap(dlf, fts, llf, true)
  }

  static fromThreeJsMesh(threeJsObj: Object3D, tryToQuadify: typeof QUADIFY | typeof DONT_QUADIFY = QUADIFY) {
    const map = new ArxMap()

    map.polygons.addThreeJsMesh(threeJsObj, tryToQuadify)

    return map
  }

  private static async getGeneratorId() {
    return `Arx Level Generator - version ${await getPackageVersion()}`
  }

  finalize() {
    if (this.config.isFinalized) {
      throw new MapFinalizedError()
    }

    this.polygons.forEach((polygon) => {
      polygon.calculateNormals()
      polygon.calculateArea()
    })

    this.calculateRoomData()

    this.config.isFinalized = true
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
            const color = polygon.vertices[i]?.color ?? Color.transparent
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

    this.portals = []

    this.todo.rooms.forEach((room) => {
      room.portals = []
    })
    this.todo.roomDistances = [
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

    this.movePolygonsToSameRoom()
  }

  private movePolygonsToSameRoom() {
    this.polygons.forEach((polygon) => {
      if (polygon.room < 1) {
        return
      }

      polygon.room = 1
    })

    this.todo.rooms = this.todo.rooms.slice(0, 2)
    this.todo.roomDistances = [
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
    this.todo.rooms.forEach((room) => {
      room.polygons = []
    })

    const polygonsPerCellCounter: Record<string, number> = {}

    this.polygons.forEach((polygon) => {
      if (polygon.room < 1) {
        return
      }

      const vertices = polygon.vertices.map((vertex) => vertex.toArxVertex())

      const [cellX, cellY] = getCellCoords(vertices as QuadrupleOf<ArxVertex>)

      const key = `${cellX}|${cellY}`

      if (key in polygonsPerCellCounter) {
        polygonsPerCellCounter[key] += 1
      } else {
        polygonsPerCellCounter[key] = 0
      }

      this.todo.rooms[polygon.room].polygons.push({ cellX, cellY, polygonIdx: polygonsPerCellCounter[key] })
    })
  }

  async saveToDisk(outputDir: string, levelIdx: number, prettify = false) {
    if (!this.config.isFinalized) {
      throw new MapNotFinalizedError()
    }

    const defaultOutputDir = path.resolve('./dist')

    console.log('output directory:', outputDir)

    if (outputDir === defaultOutputDir) {
      try {
        await fs.promises.rm('dist', { recursive: true })
      } catch (e) {}
    } else {
      await uninstall(outputDir)
    }

    // ------------------------

    const textures = await this.polygons.exportTextures(outputDir)

    const resets: Record<string, string> = {}
    if (!this.config.isMinimapVisible) {
      const source = path.resolve('assets', 'reset/map.bmp')
      const target = path.resolve(outputDir, `graph/levels/level${levelIdx}/map.bmp`)
      resets[target] = source
    }

    const files = {
      dlf: path.resolve(outputDir, `graph/levels/level${levelIdx}/level${levelIdx}.dlf.json`),
      fts: path.resolve(outputDir, `game/graph/levels/level${levelIdx}/fast.fts.json`),
      llf: path.resolve(outputDir, `graph/levels/level${levelIdx}/level${levelIdx}.llf.json`),
    }

    const manifest = {
      files: [
        ...Object.keys(textures),
        ...Object.keys(resets),
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

    // ------------------------

    const filesToCopy = [...Object.entries(textures), ...Object.entries(resets)]

    for (let [target, source] of filesToCopy) {
      await fs.promises.copyFile(source, target)
    }

    // ------------------------

    const { dlf, fts, llf } = await this.toArxData(levelIdx)

    const stringifiedDlf = prettify ? JSON.stringify(dlf, null, 2) : JSON.stringify(dlf)
    const stringifiedFts = prettify ? JSON.stringify(fts, null, 2) : JSON.stringify(fts)
    const stringifiedLlf = prettify ? JSON.stringify(llf, null, 2) : JSON.stringify(llf)

    await fs.promises.writeFile(files.dlf, stringifiedDlf)
    await fs.promises.writeFile(files.fts, stringifiedFts)
    await fs.promises.writeFile(files.llf, stringifiedLlf)

    await fs.promises.writeFile(`${outputDir}arx-level-generator-manifest.json`, JSON.stringify(manifest, null, 2))
  }

  adjustOffsetTo(map: ArxMap) {
    const offsetDifference = map.config.offset.clone().sub(this.config.offset)
    this.polygons.move(offsetDifference)
  }

  move(offset: Vector3) {
    if (this.config.isFinalized) {
      throw new MapFinalizedError()
    }

    this.polygons.move(offset)

    this.entities.move(offset)
    this.lights.move(offset)

    this.fogs.forEach((fog) => {
      fog.position.add(offset)
    })

    this.paths.forEach((path) => {
      path.points.forEach((point) => {
        point.position.add(offset)
      })
    })

    this.zones.forEach((zone) => {
      zone.points.forEach((point) => {
        point.position.add(offset)
      })
    })

    // anchors
    this.todo.anchors.forEach((anchor) => {
      anchor.data.pos.x += offset.x
      anchor.data.pos.y += offset.y
      anchor.data.pos.z += offset.z
    })
  }

  add(map: ArxMap, alignPolygons: boolean = false) {
    if (this.config.isFinalized) {
      throw new MapFinalizedError()
    }

    if (alignPolygons) {
      map.adjustOffsetTo(this)
    }

    map.polygons.forEach((polygon) => {
      this.polygons.push(polygon)
    })

    map.lights.forEach((light) => {
      this.lights.push(light)
    })

    map.fogs.forEach((fog) => {
      this.fogs.push(fog)
    })

    map.entities.forEach((entity) => {
      this.entities.push(entity)
    })

    map.paths.forEach((path) => {
      this.paths.push(path)
    })

    map.zones.forEach((zone) => {
      this.zones.push(zone)
    })

    // map.anchors.forEach((anchor) => {
    //   this.anchors.push(anchor)
    // })
    // TODO: adjust fts anchor linked anchor indices
    // TODO: adjust fts polygon texture container ids
  }

  hideMinimap() {
    this.config.isMinimapVisible = false
  }
}
