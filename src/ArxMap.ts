import fs from 'node:fs'
import path from 'node:path'
import { Box3, Object3D } from 'three'
import { getCellCoords, MAP_DEPTH_IN_CELLS, MAP_WIDTH_IN_CELLS, QuadrupleOf } from 'arx-convert/utils'
import {
  ArxAMB,
  ArxAnchor,
  ArxCell,
  ArxDLF,
  ArxFTS,
  ArxLLF,
  ArxRoom,
  ArxRoomDistance,
  ArxUniqueHeader,
  ArxVertex,
} from 'arx-convert/types'
import { times } from '@src/faux-ramda.js'
import { Vector3 } from '@src/Vector3.js'
import { getPackageVersion, latin9ToLatin1, uninstall } from '@src/helpers.js'
import { Polygon } from '@src/Polygon.js'
import { OriginalLevel } from '@src/types.js'
import { LevelLoader } from '@src/LevelLoader.js'
import { MapFinalizedError, MapNotFinalizedError } from '@src/errors.js'
import { Light } from '@src/Light.js'
import { Player } from '@src/Player.js'
import { Rotation } from '@src/Rotation.js'
import { Entity } from '@src/Entity.js'
import { Fog } from '@src/Fog.js'
import { Zone } from '@src/Zone.js'
import { Portal } from '@src/Portal.js'
import { Path } from '@src/Path.js'
import { MeshImportProps, Polygons } from '@src/Polygons.js'
import { Entities } from '@src/Entities.js'
import { Lights } from '@src/Lights.js'
import { AMB } from 'arx-convert'
import { Script } from '@src/Script.js'
import { HUD } from '@src/HUD.js'
import { Translations } from '@src/Translations.js'
import { MetaData } from '@src/MetaData.js'
import { Audio } from './Audio.js'

type ArxMapConfig = {
  isFinalized: boolean
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
  meta: MetaData = new MetaData()
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
    offset: new Vector3(0, 0, 0),
  }
  hud: HUD = new HUD()
  i18n: Translations = new Translations()
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
      colors: this.polygons.getVertexColors(),
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

  static fromThreeJsMesh(threeJsObj: Object3D, meshImportProps: MeshImportProps) {
    const map = new ArxMap()

    map.polygons.addThreeJsMesh(threeJsObj, meshImportProps)

    return map
  }

  private static async getGeneratorId() {
    return `Arx Level Generator - version ${await getPackageVersion()}`
  }

  finalize() {
    if (this.config.isFinalized) {
      throw new MapFinalizedError()
    }

    const numberOfRemovedPolygons = this.polygons.removeOutOfBoundPolygons()

    if (numberOfRemovedPolygons > 0) {
      console.warn(
        `Removed ${numberOfRemovedPolygons} polygons what are outside the 0..16000 boundary on the X or Z axis`,
      )
    }

    this.polygons.forEach((polygon) => {
      polygon.calculateNormals()
      polygon.calculateArea()
    })

    this.calculateRoomData()

    this.config.isFinalized = true
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
    this.polygons.moveToRoom1()

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

    const defaultOutputDir = path.resolve('./dist') + '/'
    outputDir = path.resolve(outputDir) + '/'

    console.log('output directory:', outputDir)

    if (outputDir === defaultOutputDir) {
      try {
        await fs.promises.rm(defaultOutputDir, { recursive: true })
      } catch (e) {}
    } else {
      await uninstall(outputDir)
    }

    this.meta.generatorVersion = await getPackageVersion()

    // ------------------------

    let textures = await this.polygons.exportTextures(outputDir)

    const hudElements = this.hud.exportSourcesAndTargets(outputDir, levelIdx)

    const ambienceTracks = this.zones.reduce((acc, zone) => {
      if (zone.ambience === undefined || zone.ambience.isNative) {
        return acc
      }

      zone.ambience.exportSourcesAndTargets(outputDir).forEach(([source, target]) => {
        acc[target] = source
      })

      return acc
    }, {} as Record<string, string>)

    const customAmbiences = this.zones.reduce((acc, zone) => {
      if (zone.ambience === undefined || zone.ambience.isNative) {
        return acc
      }

      return {
        ...acc,
        ...zone.ambience.toArxData(outputDir),
      }
    }, {} as Record<string, ArxAMB>)

    const scripts: Record<string, string> = {}
    const models: Record<string, string> = {}

    for (let entity of this.entities) {
      if (entity.script !== undefined) {
        scripts[entity.exportScriptTarget(outputDir)] = await entity.script.toArxData()
        const texturesToExport = await entity.script.exportTextures(outputDir)
        for (let target in texturesToExport) {
          textures[target] = texturesToExport[target]
        }
      }

      if (entity.inventoryIcon !== undefined) {
        const texturesToExport = await entity.exportInventoryIcon(outputDir)
        for (let target in texturesToExport) {
          textures[target] = texturesToExport[target]
        }
      }

      if (entity.model !== undefined) {
        const modelToExport = await entity.exportModel(outputDir)
        for (let target in modelToExport) {
          models[target] = modelToExport[target]
        }
        const texturesToExport = await entity.exportTextures(outputDir)
        for (let target in texturesToExport) {
          textures[target] = texturesToExport[target]
        }
      }
    }

    const sounds = await Audio.exportReplacements(outputDir)

    // TODO: removing root entities in a hacky way
    const filteredEntities = new Entities()
    this.entities
      .filter((entity) => {
        if (entity.script === undefined) {
          return true
        }
        return !entity.script.isRoot
      })
      .forEach((entity) => {
        filteredEntities.push(entity)
      })
    this.entities = filteredEntities

    if (this.player.script !== undefined) {
      scripts[this.player.exportTarget(outputDir)] = await this.player.script.toArxData()
      textures = { ...textures, ...(await this.player.script.exportTextures(outputDir)) }
    }

    const translations = this.i18n.exportSourcesAndTargets(outputDir)

    const files = {
      dlf: path.resolve(outputDir, `graph/levels/level${levelIdx}/level${levelIdx}.dlf.json`),
      fts: path.resolve(outputDir, `game/graph/levels/level${levelIdx}/fast.fts.json`),
      llf: path.resolve(outputDir, `graph/levels/level${levelIdx}/level${levelIdx}.llf.json`),
    }

    const manifest = {
      meta: this.meta.toData(),
      files: [
        ...Object.keys(textures),
        ...Object.keys(models),
        ...Object.keys(sounds),
        ...Object.keys(hudElements),
        ...Object.keys(ambienceTracks),
        ...Object.keys(customAmbiences),
        ...Object.keys(customAmbiences).map((filename) => filename.replace(/\.json$/, '')),
        ...Object.keys(scripts),
        ...Object.keys(translations),
        ...Object.values(files),
        ...Object.values(files).map((filename) => filename.replace(/\.json$/, '')),
      ],
    }

    const tasks = manifest.files.map((filename) => {
      return fs.promises.mkdir(path.dirname(filename), { recursive: true })
    })

    for (let task of tasks) {
      await task
    }

    // ------------------------

    const filesToCopy = [
      ...Object.entries(textures),
      ...Object.entries(hudElements),
      ...Object.entries(ambienceTracks),
      ...Object.entries(models),
      ...Object.entries(sounds),
    ]

    for (let [target, source] of filesToCopy) {
      await fs.promises.copyFile(source, target)
    }

    // ------------------------

    for (const [target, amb] of Object.entries(customAmbiences)) {
      const stringifiedAmb = prettify ? JSON.stringify(amb, null, 2) : JSON.stringify(amb)
      await fs.promises.writeFile(target, stringifiedAmb)

      const compiledAmb = AMB.save(amb)
      await fs.promises.writeFile(target.replace(/\.json$/, ''), compiledAmb)
    }

    // ------------------------

    for (const [target, script] of Object.entries(scripts)) {
      const latin1Script = latin9ToLatin1(script.replace(/\n/g, Script.EOL))
      await fs.promises.writeFile(target, latin1Script, 'latin1')
    }

    for (const [filename, translation] of Object.entries(translations)) {
      await fs.promises.writeFile(
        filename,
        `// ${this.meta.mapName} - Arx Level Generator ${this.meta.generatorVersion}
  
  ${translation}`,
        'utf8',
      )
    }

    // ------------------------

    const { dlf, fts, llf } = await this.toArxData(levelIdx)

    const stringifiedDlf = prettify ? JSON.stringify(dlf, null, 2) : JSON.stringify(dlf)
    const stringifiedFts = prettify ? JSON.stringify(fts, null, 2) : JSON.stringify(fts)
    const stringifiedLlf = prettify ? JSON.stringify(llf, null, 2) : JSON.stringify(llf)

    await fs.promises.writeFile(files.dlf, stringifiedDlf)
    await fs.promises.writeFile(files.fts, stringifiedFts)
    await fs.promises.writeFile(files.llf, stringifiedLlf)

    manifest.files = manifest.files.map((file) => {
      return file.replace(outputDir, '')
    })

    await fs.promises.writeFile(
      path.resolve(outputDir, 'arx-level-generator-manifest.json'),
      JSON.stringify(manifest, null, 2),
    )
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

  getBoundingBox() {
    const box = new Box3()

    this.polygons
      .flatMap((p) => {
        return p.isQuad() ? p.vertices : p.vertices.slice(0, 3)
      })
      .forEach((vertex) => {
        box.expandByPoint(vertex)
      })

    return box
  }

  getCenter() {
    const bb = this.getBoundingBox()
    const center = new Vector3()
    bb.getCenter(center)
    return center
  }

  getHeight() {
    const bb = this.getBoundingBox()
    return bb.max.clone().sub(bb.min).y
  }

  getWidth() {
    const bb = this.getBoundingBox()
    return bb.max.clone().sub(bb.min).x
  }

  getDepth() {
    const bb = this.getBoundingBox()
    return bb.max.clone().sub(bb.min).z
  }
}
