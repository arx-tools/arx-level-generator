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
  ArxPolygon,
  ArxRoom,
  ArxRoomDistance,
  ArxTextureContainer,
  ArxUniqueHeader,
  ArxVertex,
} from 'arx-convert/types'
import { times } from './faux-ramda'
import { Vector3 } from './Vector3'
import { evenAndRemainder, getPackageVersion, uninstall } from './helpers'
import { Color } from './Color'
import { Polygon, NindexType } from './Polygon'
import { OriginalLevel } from './types'
import { LevelLoader } from './LevelLoader'
import { MapFinalizedError, MapNotFinalizedError } from './errors'
import { Light } from './Light'
import { Player } from './Player'
import { Rotation } from './Rotation'
import { Entity } from './Entity'
import { Fog } from './Fog'
import { Zone } from './Zone'
import { Portal } from './Portal'
import { Path } from './Path'

type ArxMapConfig = {
  isFinalized: boolean
}

type ToBeSortedLater = {
  uniqueHeaders: ArxUniqueHeader[]
  mScenePosition: Vector3
  cells: Omit<ArxCell, 'polygons'>[]
  anchors: ArxAnchor[]
  rooms: ArxRoom[]
  roomDistances: ArxRoomDistance[]
}

export class ArxMap {
  polygons: Polygon[] = []
  lights: Light[] = []
  fogs: Fog[] = []
  entities: Entity[] = []
  zones: Zone[] = []
  paths: Path[] = []
  player: Player = new Player()
  portals: Portal[] = []
  config: ArxMapConfig = {
    isFinalized: false,
  }
  todo: ToBeSortedLater = {
    uniqueHeaders: [],
    mScenePosition: new Vector3(0, 0, 0),
    cells: times(() => ({}), MAP_DEPTH_IN_CELLS * MAP_WIDTH_IN_CELLS),
    anchors: [],
    rooms: [
      { portals: [], polygons: [] },
      { portals: [], polygons: [] },
    ],
    roomDistances: [],
  }

  constructor(dlf?: ArxDLF, fts?: ArxFTS, llf?: ArxLLF, areNormalsCalculated = false) {
    if (typeof dlf === 'undefined' || typeof fts === 'undefined' || typeof llf === 'undefined') {
      return
    }

    this.player.orientation = Rotation.fromArxRotation(dlf.header.angleEdit)
    this.player.position = Vector3.fromArxVector3(dlf.header.posEdit)

    this.entities = dlf.interactiveObjects.map(Entity.fromArxInteractiveObject)

    this.fogs = dlf.fogs.map(Fog.fromArxFog)
    this.zones = dlf.zones.map(Zone.fromArxZone)
    this.paths = dlf.paths.map(Path.fromArxPath)

    this.polygons = fts.polygons.map((polygon) => {
      return Polygon.fromArxPolygon(polygon, llf.colors, fts.textureContainers, areNormalsCalculated)
    })

    this.portals = fts.portals.map(Portal.fromArxPortal)
    this.lights = llf.lights.map(Light.fromArxLight)

    // TODO: deal with these stuff later
    this.todo.uniqueHeaders = fts.uniqueHeaders
    this.todo.mScenePosition = Vector3.fromArxVector3(fts.sceneHeader.mScenePosition)
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
      interactiveObjects: this.entities.map((entity) => {
        return entity.toArxInteractiveObject()
      }),
      fogs: this.fogs.map((fog) => {
        return fog.toArxFog()
      }),
      paths: this.paths.map((path) => {
        return path.toArxPath()
      }),
      zones: this.zones.map((zone) => {
        return zone.toArxZone()
      }),
    }

    const textureContainers = this.getTextureContainers()

    const polygons: ArxPolygon[] = this.polygons.map((polygon) => {
      return polygon.toArxPolygon(textureContainers)
    })

    const fts: ArxFTS = {
      header: {
        levelIdx,
      },
      uniqueHeaders: this.todo.uniqueHeaders,
      sceneHeader: {
        mScenePosition: this.todo.mScenePosition.toArxVector3(),
      },
      textureContainers: textureContainers.map(({ id, filename }): ArxTextureContainer => {
        return { id, filename }
      }),
      cells: this.todo.cells,
      polygons,
      anchors: this.todo.anchors,
      portals: this.portals.map((portal) => {
        return portal.toArxPortal()
      }),
      rooms: this.todo.rooms,
      roomDistances: this.todo.roomDistances,
    }

    const llf: ArxLLF = {
      header: {
        lastUser: generatorId,
        time: now,
        numberOfBackgroundPolygons: this.polygons.length,
      },
      colors: this.getVertexColors(),
      lights: this.lights.map((light) => {
        return light.toArxLight()
      }),
    }

    return {
      dlf,
      fts,
      llf,
    }
  }

  countNindices() {
    const nindices: Record<string, Record<NindexType, number>> = {}

    this.polygons.forEach((polygon) => {
      if (typeof polygon.texture === 'undefined') {
        return
      }

      if (!(polygon.texture.filename in nindices)) {
        nindices[polygon.texture.filename] = {
          additive: 0,
          blended: 0,
          multiplicative: 0,
          opaque: 0,
          subtractive: 0,
        }
      }

      nindices[polygon.texture.filename][polygon.getNindexType()] += polygon.getNindices()
    })

    return nindices
  }

  getTextureContainers() {
    const textureContainers: (ArxTextureContainer & { remaining: number })[] = []

    let cntr = 0

    const nindices = this.countNindices()

    Object.entries(nindices).forEach(([filename, nindices]) => {
      const maxNindices = Math.max(...Object.values(nindices))

      const [wholeBlocks, remainder] = evenAndRemainder(65535, maxNindices)

      times(() => {
        textureContainers.push({ id: ++cntr, filename, remaining: 65535 })
      }, wholeBlocks)

      textureContainers.push({ id: ++cntr, filename, remaining: remainder })
    })

    return textureContainers
  }

  /**
   * Loads one of the levels found in the original game
   *
   * Requires the pkware-test-files repo
   * @see https://github.com/meszaros-lajos-gyorgy/pkware-test-files
   */
  static async loadLevel(levelIdx: OriginalLevel) {
    const loader = new LevelLoader(levelIdx)

    const dlf = await loader.readDlf()
    const fts = await loader.readFts()
    const llf = await loader.readLlf()

    return new ArxMap(dlf, fts, llf, true)
  }

  private static async getGeneratorId() {
    return `Arx Level Generator - version ${await getPackageVersion()}`
  }

  finalize() {
    if (this.config.isFinalized) {
      throw new MapFinalizedError()
    }

    this.calculateNormals()
    this.calculateRoomData()

    this.config.isFinalized = true
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

  async saveToDisk(outputDir: string, levelIdx: number, prettify: boolean = false) {
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

    const { dlf, fts, llf } = await this.toArxData(levelIdx)

    const stringifiedDlf = prettify ? JSON.stringify(dlf, null, 2) : JSON.stringify(dlf)
    const stringifiedFts = prettify ? JSON.stringify(fts, null, 2) : JSON.stringify(fts)
    const stringifiedLlf = prettify ? JSON.stringify(llf, null, 2) : JSON.stringify(llf)

    await fs.promises.writeFile(files.dlf, stringifiedDlf)
    await fs.promises.writeFile(files.fts, stringifiedFts)
    await fs.promises.writeFile(files.llf, stringifiedLlf)

    await fs.promises.writeFile(`${outputDir}arx-level-generator-manifest.json`, JSON.stringify(manifest, null, 2))
  }

  alignPolygonsTo(map: ArxMap) {
    const offset = map.todo.mScenePosition.clone().sub(this.todo.mScenePosition)
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

    this.lights.forEach((light) => {
      light.position.add(offset)
    })

    this.fogs.forEach((fog) => {
      fog.position.add(offset)
    })

    this.entities.forEach((entity) => {
      entity.position.add(offset)
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

  move(offset: Vector3) {
    this.movePolygons(offset)
    this.moveEntities(offset)
  }

  add(map: ArxMap) {
    if (this.config.isFinalized) {
      throw new MapFinalizedError()
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
}
