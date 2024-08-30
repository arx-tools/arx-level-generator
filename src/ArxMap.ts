import fs from 'node:fs/promises'
import path from 'node:path'
import { AMB } from 'arx-convert'
import {
  type ArxAMB,
  type ArxAnchor,
  type ArxCell,
  type ArxDLF,
  type ArxFTS,
  type ArxLLF,
  type ArxRoom,
  type ArxRoomDistance,
  type ArxUniqueHeader,
  type ArxVertex,
} from 'arx-convert/types'
import { getCellCoords, MAP_DEPTH_IN_CELLS, MAP_WIDTH_IN_CELLS, type QuadrupleOf } from 'arx-convert/utils'
import { type Object3D } from 'three'
import { Audio } from '@src/Audio.js'
import { Entities } from '@src/Entities.js'
import { Entity } from '@src/Entity.js'
import { Fog } from '@src/Fog.js'
import { Fogs } from '@src/Fogs.js'
import { HUD } from '@src/HUD.js'
import { LevelLoader } from '@src/LevelLoader.js'
import { Light } from '@src/Light.js'
import { Lights } from '@src/Lights.js'
import { Manifest } from '@src/Manifest.js'
import { generateMetadata } from '@src/MetaData.js'
import { Path } from '@src/Path.js'
import { Paths } from '@src/Paths.js'
import { Player } from '@src/Player.js'
import { Polygon } from '@src/Polygon.js'
import { type MeshImportProps, Polygons } from '@src/Polygons.js'
import { Portal } from '@src/Portal.js'
import { Rotation } from '@src/Rotation.js'
import { Script } from '@src/Script.js'
import { $ } from '@src/Selection.js'
import { type Settings } from '@src/Settings.js'
import { Translations } from '@src/Translations.js'
import { UI } from '@src/UI.js'
import { Vector3 } from '@src/Vector3.js'
import { Zone } from '@src/Zone.js'
import { Zones } from '@src/Zones.js'
import { compile } from '@src/compile.js'
import { MapFinalizedError, MapNotFinalizedError } from '@src/errors.js'
import { groupSequences, times, uniq } from '@src/faux-ramda.js'
import { getGeneratorPackageJSON, latin9ToLatin1 } from '@src/helpers.js'
import { type OriginalLevel } from '@src/types.js'
import { createPlaneMesh } from '@prefabs/mesh/plane.js'
import { Texture } from './Texture.js'

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
  /**
   * Loads one of the levels found in the original game
   *
   * Requires the pkware-test-files repo
   * @see https://github.com/meszaros-lajos-gyorgy/pkware-test-files
   */
  static async fromOriginalLevel(levelIdx: OriginalLevel, settings: Settings): Promise<ArxMap> {
    const loader = new LevelLoader(levelIdx, settings)

    const dlf = await loader.readDlf()
    const fts = await loader.readFts()
    const llf = await loader.readLlf()

    return new ArxMap(dlf, fts, llf, true)
  }

  static fromThreeJsMesh(threeJsObj: Object3D, meshImportProps: MeshImportProps): ArxMap {
    const map = new ArxMap()

    map.polygons.addThreeJsMesh(threeJsObj, meshImportProps)

    return map
  }

  private static async getGeneratorId(): Promise<string> {
    const generator = await getGeneratorPackageJSON()
    return `${generator.name} - v.${generator.version}`
  }

  polygons = new Polygons()
  lights = new Lights()
  fogs = new Fogs()
  entities = new Entities()
  zones = new Zones()
  paths = new Paths()
  player = new Player()
  portals: Portal[] = [] // TODO: create Portals class
  config: ArxMapConfig = {
    isFinalized: false,
    offset: new Vector3(0, 0, 0),
  }

  hud: HUD = new HUD()
  ui: UI = new UI()
  i18n: Translations = new Translations()
  todo: ToBeSortedLater = {
    uniqueHeaders: [],
    cells: times(() => {
      return {}
    }, MAP_DEPTH_IN_CELLS * MAP_WIDTH_IN_CELLS),
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
        startPosition: { x: 0.984_375, y: 0.984_375, z: 0 },
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
    if (dlf === undefined || fts === undefined || llf === undefined) {
      return
    }

    this.player.orientation = Rotation.fromArxRotation(dlf.header.angleEdit)
    this.player.position = Vector3.fromArxVector3(dlf.header.posEdit)

    dlf.interactiveObjects.forEach((entity) => {
      this.entities.push(Entity.fromArxInteractiveObject(entity))
    })

    dlf.fogs.forEach((fog) => {
      this.fogs.push(Fog.fromArxFog(fog))
    })
    dlf.zones.forEach((zone) => {
      this.zones.push(Zone.fromArxZone(zone))
    })
    dlf.paths.forEach((path) => {
      this.paths.push(Path.fromArxPath(path))
    })

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

  finalize(settings: Settings): void {
    if (this.config.isFinalized) {
      throw new MapFinalizedError()
    }

    const removedPolygons = $(this.polygons).clearSelection().selectOutOfBounds().delete()

    if (removedPolygons.length > 0) {
      console.warn(
        `[warning] ArxMap: Removed ${removedPolygons.length} polygons what are outside the 0..16000 boundary on the X or Z axis`,
      )
    }

    if (this.polygons.length === 0) {
      console.warn(`[warning] ArxMap: The map has no polygons, adding a quad below the player's feet`)
      this.addTileUnderThePlayersFeet()
      $(this.polygons).clearSelection().selectOutOfBounds().delete()
      if (this.polygons.length === 0) {
        console.warn(
          `[warning] ArxMap: Failed to add polygon below the player's feet as it was partially or fully out of the 0..16000 boundary on the X or Z axis`,
        )
      }
    }

    this.polygons.forEach((polygon) => {
      polygon.calculateNormals()
      polygon.calculateArea()
    })

    this.calculateRoomData()

    if (settings.calculateLighting && this.lights.length > 0) {
      this.calculateLighting()
    }

    this.config.isFinalized = true
  }

  removePortals(): void {
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
        startPosition: { x: 0.984_375, y: 0.984_375, z: 0 },
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

  async saveToDisk(settings: Settings, exportJsonFiles: boolean = false, prettify: boolean = false): Promise<void> {
    if (!this.config.isFinalized) {
      throw new MapNotFinalizedError()
    }

    console.log(`[info] ArxMap: seed = "${settings.seed}"`)
    console.log(`[info] ArxMap: output directory = "${settings.outputDir}"`)

    await Manifest.uninstall(settings)

    const meta = await generateMetadata(settings)

    // ------------------------

    let textures = await this.polygons.exportTextures(settings)

    const hudElements = this.hud.exportSourcesAndTargets(settings)
    const uiElements = this.ui.exportSourcesAndTargets(settings)

    const ambienceTracks: Record<string, string> = {}
    this.zones.forEach((zone) => {
      if (!zone.hasAmbience() || zone.ambience.isNative) {
        return
      }

      zone.ambience.exportSourcesAndTargets(settings).forEach(([source, target]) => {
        ambienceTracks[target] = source
      })
    })

    let customAmbiences: Record<string, ArxAMB> = {}
    this.zones.forEach((zone) => {
      if (!zone.hasAmbience() || zone.ambience.isNative) {
        return
      }

      customAmbiences = {
        ...customAmbiences,
        ...zone.ambience.toArxData(settings),
      }
    })

    const scripts: Record<string, string> = {}
    const models: Record<string, string> = {}
    const otherDependencies: Record<string, string> = {}

    for (const entity of this.entities) {
      if (entity.hasScript()) {
        scripts[entity.exportScriptTarget(settings)] = entity.script.toArxData()
        const texturesToExport = await entity.script.exportTextures(settings)
        for (const target in texturesToExport) {
          textures[target] = texturesToExport[target]
        }
      }

      if (entity.hasInventoryIcon()) {
        const texturesToExport = await entity.exportInventoryIcon(settings)
        for (const target in texturesToExport) {
          textures[target] = texturesToExport[target]
        }
      }

      if (entity.hasModel()) {
        const modelToExport = await entity.model.exportSourceAndTarget(settings, entity.src, exportJsonFiles, prettify)
        for (const target in modelToExport) {
          models[target] = modelToExport[target]
        }
      }

      const dependenciesToExport = await entity.exportOtherDependencies(settings)
      for (const target in dependenciesToExport) {
        otherDependencies[target] = dependenciesToExport[target]
      }
    }

    const sounds = Audio.exportReplacements(settings)

    // removing root entities while also making sure the entities land in an Entities object and not in an array
    const nonRootEntities = new Entities()
    this.entities.forEach((entity) => {
      if (entity.hasScript() && entity.script.isRoot) {
        return
      }

      nonRootEntities.push(entity)
    })

    this.entities = nonRootEntities

    if (this.player.hasScript()) {
      scripts[this.player.exportTarget(settings)] = this.player.script.toArxData()
      textures = {
        ...textures,
        ...(await this.player.script.exportTextures(settings)),
      }
    }

    const translations = this.i18n.exportSourcesAndTargets(settings)

    const files = {
      dlf: path.resolve(
        settings.outputDir,
        `graph/levels/level${settings.levelIdx}/level${settings.levelIdx}.dlf.json`,
      ),
      fts: path.resolve(settings.outputDir, `game/graph/levels/level${settings.levelIdx}/fast.fts.json`),
      llf: path.resolve(
        settings.outputDir,
        `graph/levels/level${settings.levelIdx}/level${settings.levelIdx}.llf.json`,
      ),
    }

    const pathsOfTheFiles = [
      ...Object.keys(textures),
      ...Object.keys(models),
      ...Object.keys(otherDependencies),
      ...Object.keys(sounds),
      ...Object.keys(hudElements),
      ...Object.keys(uiElements),
      ...Object.keys(ambienceTracks),
      ...Object.keys(customAmbiences).map((filename) => {
        return filename.replace(/\.json$/, '')
      }),
      ...Object.keys(scripts),
      ...Object.keys(translations),
      ...Object.values(files).map((filename) => {
        return filename.replace(/\.json$/, '')
      }),
    ]

    const dirnames = uniq(pathsOfTheFiles.map(path.dirname.bind(path)))
    for (const dirname of dirnames) {
      await fs.mkdir(dirname, { recursive: true })
    }

    // ------------------------

    const filesToCopy = [
      ...Object.entries(textures),
      ...Object.entries(hudElements),
      ...Object.entries(uiElements),
      ...Object.entries(ambienceTracks),
      ...Object.entries(models),
      ...Object.entries(otherDependencies),
      ...Object.entries(sounds),
    ]

    for (const [target, source] of filesToCopy) {
      await fs.copyFile(source, target)
    }

    // ------------------------

    for (const [target, script] of Object.entries(scripts)) {
      const latin1Script = latin9ToLatin1(script.replaceAll('\n', Script.EOL))
      await fs.writeFile(target, latin1Script, 'latin1')
    }

    const generatorId = await ArxMap.getGeneratorId()

    for (const [filename, translation] of Object.entries(translations)) {
      await fs.writeFile(
        filename,
        `// ${meta.name} v.${meta.version} - ${generatorId}
  
  ${translation}`,
        'utf8',
      )
    }

    // ------------------------

    const { dlf, fts, llf } = await this.toArxData(settings)

    if (exportJsonFiles) {
      let stringifiedDlf: string
      let stringifiedFts: string
      let stringifiedLlf: string

      if (prettify) {
        stringifiedDlf = JSON.stringify(dlf, null, 2)
        stringifiedFts = JSON.stringify(fts, null, 2)
        stringifiedLlf = JSON.stringify(llf, null, 2)
      } else {
        stringifiedDlf = JSON.stringify(dlf)
        stringifiedFts = JSON.stringify(fts)
        stringifiedLlf = JSON.stringify(llf)
      }

      await fs.writeFile(files.dlf, stringifiedDlf)
      await fs.writeFile(files.fts, stringifiedFts)
      await fs.writeFile(files.llf, stringifiedLlf)

      for (const [target, amb] of Object.entries(customAmbiences)) {
        let stringifiedAmb: string
        if (prettify) {
          stringifiedAmb = JSON.stringify(amb, null, 2)
        } else {
          stringifiedAmb = JSON.stringify(amb)
        }

        await fs.writeFile(target, stringifiedAmb)
      }

      pathsOfTheFiles.push(...Object.keys(customAmbiences), ...Object.values(files))
    }

    for (const [target, amb] of Object.entries(customAmbiences)) {
      const compiledAmb = AMB.save(amb)
      await fs.writeFile(target.replace(/\.json$/, ''), compiledAmb)
    }

    await compile(settings, { dlf, fts, llf })

    // ------------------------

    await Manifest.write(settings, pathsOfTheFiles)
  }

  adjustOffsetTo(map: ArxMap): void {
    const offsetDifference = map.config.offset.clone().sub(this.config.offset)
    $(this.polygons).selectAll().move(offsetDifference)
  }

  move(offset: Vector3): void {
    if (this.config.isFinalized) {
      throw new MapFinalizedError()
    }

    $(this.polygons).selectAll().move(offset)
    $(this.entities).selectAll().move(offset)
    $(this.lights).selectAll().move(offset)
    $(this.fogs).selectAll().move(offset)
    $(this.paths).selectAll().move(offset)
    $(this.zones).selectAll().move(offset)

    // anchors
    this.todo.anchors.forEach((anchor) => {
      anchor.data.pos.x = anchor.data.pos.x + offset.x
      anchor.data.pos.y = anchor.data.pos.y + offset.y
      anchor.data.pos.z = anchor.data.pos.z + offset.z
    })
  }

  add(map: ArxMap, alignPolygons: boolean = false): void {
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

  private async toArxData(settings: Settings): Promise<{ dlf: ArxDLF; llf: ArxLLF; fts: ArxFTS }> {
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
        levelIdx: settings.levelIdx,
      },
      ...this.fogs.toArxData(),
      ...this.paths.toArxData(),
      ...this.zones.toArxData(),
      ...this.entities.toArxData(),
    }

    const fts: ArxFTS = {
      header: {
        levelIdx: settings.levelIdx,
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
      ...(await this.polygons.toArxData()),
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

  private addTileUnderThePlayersFeet(): void {
    const playerPos = this.config.offset
      .clone()
      .add(this.player.position)
      .sub(new Vector3(0, 0, 0).adjustToPlayerHeight())

    const plane = createPlaneMesh({
      size: 100,
      tileSize: 100,
      texture: Texture.missingTexture,
    })
    plane.position.set(playerPos.x, playerPos.y, playerPos.z)

    this.polygons.addThreeJsMesh(plane)
  }

  private movePolygonsToSameRoom(): void {
    $(this.polygons).selectAll().moveToRoom1()

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
        startPosition: { x: 0.984_375, y: 0.984_375, z: 0 },
        endPosition: { x: 0, y: 0, z: 0 },
      },
      {
        distance: -1,
        startPosition: { x: 0, y: 0, z: 0 },
        endPosition: { x: 0, y: 0, z: 0 },
      },
    ]
  }

  private calculateRoomData(): void {
    this.todo.rooms.forEach((room) => {
      room.polygons = []
    })

    const polygonsPerCellCounter: Record<string, number> = {}

    let warningGivenAboutInvalidRoom = false

    const indicesOfPolygonsToBeRemoved: number[] = []

    this.polygons.forEach((polygon, index) => {
      if (polygon.room < 1) {
        return
      }

      const room = this.todo.rooms[polygon.room]
      if (room === undefined) {
        if (!warningGivenAboutInvalidRoom) {
          warningGivenAboutInvalidRoom = true
          console.warn(
            `[warning] ArxMap: Reference to a non-existent room found in the polygon data (polygons[${index}].room is ${polygon.room}). Subsequent warnings are not shown.`,
          )
        }

        indicesOfPolygonsToBeRemoved.unshift(index)

        return
      }

      const vertices = polygon.vertices.map((vertex) => {
        return vertex.toArxVertex()
      })

      const [cellX, cellY] = getCellCoords(vertices as QuadrupleOf<ArxVertex>)

      const key = `${cellX}|${cellY}`

      if (key in polygonsPerCellCounter) {
        polygonsPerCellCounter[key] = polygonsPerCellCounter[key] + 1
      } else {
        polygonsPerCellCounter[key] = 0
      }

      room.polygons.push({ cellX, cellY, polygonIdx: polygonsPerCellCounter[key] })
    })

    if (indicesOfPolygonsToBeRemoved.length > 0) {
      groupSequences(indicesOfPolygonsToBeRemoved).forEach(([start, length]) => {
        this.polygons.splice(start, length)
      })
      console.warn(
        `[warning] ArxMap: Removed ${indicesOfPolygonsToBeRemoved.length} polygons belonging to non-existent rooms`,
      )
    }
  }

  private calculateLighting(): void {
    // TODO
  }
}
