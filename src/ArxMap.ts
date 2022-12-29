import fs from 'node:fs'
import path from 'node:path'
import { getCellCoords, MAP_DEPTH_IN_CELLS, MAP_WIDTH_IN_CELLS, QuadrupleOf } from 'arx-convert/utils'
import {
  ArxColor,
  ArxDLF,
  ArxFTS,
  ArxLLF,
  ArxPolygon,
  ArxPolygonFlags,
  ArxTextureContainer,
  ArxVertex,
} from 'arx-convert/types'
import { times } from './faux-ramda'
import { Vector3 } from './Vector3'
import { getPackageVersion, uninstall } from './helpers'
import { Vertex } from './Vertex'
import { transparent } from './Color'
import { Polygon } from './Polygon'
import { OriginalLevel } from './types'
import { LevelLoader } from './LevelLoader'
import { MapFinalizedError, MapNotFinalizedError } from './errors'
import { Light } from './Light'
import { Player } from './Player'
import { Rotation } from './Rotation'
import { Entity } from './Entity'
import { Fog } from './Fog'
import { Zone } from './Zone'

type ArxMapConfig = {
  isFinalized: boolean
}

export class ArxMap {
  polygons: Polygon[] = []
  lights: Light[] = []
  fogs: Fog[] = []
  entities: Entity[] = []
  zones: Zone[] = []
  paths: any[] = []
  player: Player = new Player()
  config: ArxMapConfig = {
    isFinalized: false,
  }

  constructor(dlf?: ArxDLF, fts?: ArxFTS, llf?: ArxLLF, normalsCalculated = false) {
    if (typeof dlf !== 'undefined' && typeof fts !== 'undefined' && typeof llf !== 'undefined') {
      this.player.orientation = Rotation.fromArxRotation(dlf.header.angleEdit)

      // ? = Vector3.fromArxVector3(dlf.header.posEdit)

      this.entities = dlf.interactiveObjects.map(Entity.fromArxInteractiveObject)

      this.fogs = dlf.fogs.map(Fog.fromArxFog)

      this.zones = dlf.zones.map(Zone.fromArxZone)

      // fts.uniqueHeaders - TODO: store this somewhere

      // ? = Vector3.fromArxVector3(fts.sceneHeader.mScenePosition)
      // ? = Vector3.fromArxVector3(fts.sceneHeader.playerPosition)

      // fts.cells - TODO: store this somewhere
      // fts.cells = times(() => ({}), MAP_DEPTH_IN_CELLS * MAP_WIDTH_IN_CELLS)

      this.polygons = fts.polygons.map((polygon) => {
        return Polygon.fromArxPolygon(polygon, llf.colors, fts.textureContainers, normalsCalculated)
      })

      // fts.anchors - TODO: store this somewhere

      // fts.portals - TODO: store this somewhere

      // fts.rooms - TODO: store this somewhere
      // fts.rooms = [
      //   { portals: [], polygons: [] },
      //   { portals: [], polygons: [] },
      // ]

      // fts.roomDistances - TODO: store this somewhere
      // TODO: check to see what the existing levels have for room distances

      this.lights = llf.lights.map(Light.fromArxLight)
    }
  }

  private async toArxData(levelIdx: number) {
    const now = Math.floor(Date.now() / 1000)
    const generatorId = await ArxMap.getGeneratorId()

    const dlf: ArxDLF = {
      header: {
        lastUser: generatorId,
        time: now,
        // posEdit: ?.toArxVector3(),
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
      paths: this.zones.map((zone) => {
        return zone.toArxZone()
      }),
    }

    // TODO: extract texture containers
    const textureContainers: ArxTextureContainer[] = []
    const polygons: ArxPolygon[] = this.polygons.map((polygon) => {
      return polygon.toArxPolygon()
    })

    const fts: ArxFTS = {
      header: {
        levelIdx,
      },
      // uniqueHeaders: [] // TODO: store this somewhere
      sceneHeader: {
        // mScenePosition: ?.toArxVector3()
        // playerPosition: ?.toArxVector3()
      },
      textureContainers,
      // cells: [] // TODO: store this somewhere
      polygons,
      // anchors: [] // TODO: store this somewhere
      // portals: [] // TODO: store this somewhere
      // rooms: [] // TODO: store this somewhere
      // roomDistances: [] // TODO: store this somewhere
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
            const color = polygon.vertices[i]?.color ?? transparent
            colors.push(color.toArxColor())
          }
        })
      }
    }

    return colors
  }

  removePortals() {
    // if (this.config.isFinalized) {
    //   throw new MapFinalizedError()
    // }
    // this.fts.portals = []
    // this.fts.rooms.forEach((room) => {
    //   room.portals = []
    // })
    // this.movePolygonsToSameRoom()
  }

  private movePolygonsToSameRoom() {
    // this.polygons.forEach((polygon) => {
    //   if (polygon.polygonData.room < 1) {
    //     return
    //   }
    //   polygon.polygonData.room = 1
    // })
    // this.fts.rooms = this.fts.rooms.slice(0, 2)
    // this.fts.roomDistances = [
    //   {
    //     distance: -1,
    //     startPosition: { x: 0, y: 0, z: 0 },
    //     endPosition: { x: 1, y: 0, z: 0 },
    //   },
    //   {
    //     distance: -1,
    //     startPosition: { x: 0, y: 0, z: 0 },
    //     endPosition: { x: 0, y: 1, z: 0 },
    //   },
    //   {
    //     distance: -1,
    //     startPosition: { x: 0.984375, y: 0.984375, z: 0 },
    //     endPosition: { x: 0, y: 0, z: 0 },
    //   },
    //   {
    //     distance: -1,
    //     startPosition: { x: 0, y: 0, z: 0 },
    //     endPosition: { x: 0, y: 0, z: 0 },
    //   },
    // ]
  }

  private calculateRoomData = () => {
    // this.fts.rooms.forEach((room) => {
    //   room.polygons = []
    // })
    // const polygonsPerCellCounter: Record<string, number> = {}
    // this.polygons.forEach((polygon) => {
    //   const { room } = polygon.polygonData
    //   if (room < 1) {
    //     return
    //   }
    //   const vertices = polygon.vertices.map((vertex) => vertex.toArxVertex())
    //   const [cellX, cellY] = getCellCoords(vertices as [ArxVertex, ArxVertex, ArxVertex, ArxVertex])
    //   const key = `${cellX}|${cellY}`
    //   if (key in polygonsPerCellCounter) {
    //     polygonsPerCellCounter[key] += 1
    //   } else {
    //     polygonsPerCellCounter[key] = 0
    //   }
    //   this.fts.rooms[room].polygons.push({ cellX, cellY, polygonIdx: polygonsPerCellCounter[key] })
    // })
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
    // const offset = Vector3.fromArxVector3(map.fts.sceneHeader.mScenePosition).sub(
    //   Vector3.fromArxVector3(this.fts.sceneHeader.mScenePosition),
    // )
    // this.movePolygons(offset)
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

    // // lights
    // this.llf.lights.forEach((light) => {
    //   light.pos.x += offset.x
    //   light.pos.y += offset.y
    //   light.pos.z += offset.z
    // })

    // // fogs
    // this.dlf.fogs.forEach((fog) => {
    //   fog.pos.x += offset.x
    //   fog.pos.y += offset.y
    //   fog.pos.z += offset.z
    // })

    // // entities
    // this.dlf.interactiveObjects.forEach((obj) => {
    //   obj.pos.x += offset.x
    //   obj.pos.y += offset.y
    //   obj.pos.z += offset.z
    // })

    // // zones
    // this.dlf.paths.forEach((zone) => {
    //   zone.header.pos.x += offset.x
    //   zone.header.pos.y += offset.y
    //   zone.header.pos.z += offset.z
    // })

    // // paths
    // this.fts.anchors.forEach((anchor) => {
    //   anchor.data.pos.x += offset.x
    //   anchor.data.pos.y += offset.y
    //   anchor.data.pos.z += offset.z
    // })
  }

  move(offset: Vector3) {
    this.movePolygons(offset)
    this.moveEntities(offset)
  }

  add(map: ArxMap) {
    // if (this.config.isFinalized) {
    //   throw new MapFinalizedError()
    // }
    // // polygons
    // map.polygons.forEach((polygon) => {
    //   this.polygons.push(polygon)
    // })
    // // lights
    // map.llf.lights.forEach((light) => {
    //   this.llf.lights.push(light)
    // })
    // // fogs
    // map.dlf.fogs.forEach((fog) => {
    //   this.dlf.fogs.push(fog)
    // })
    // // entities
    // map.dlf.interactiveObjects.forEach((obj) => {
    //   this.dlf.interactiveObjects.push(obj)
    // })
    // // zones
    // map.dlf.paths.forEach((zone) => {
    //   this.dlf.paths.push(zone)
    // })
    // paths
    // map.fts.anchors.forEach((anchor) => {
    //   this.fts.anchors.push(anchor)
    // })
    // TODO: adjust fts anchor linked anchor indices
    // TODO: adjust fts polygon texture container ids
  }
}
