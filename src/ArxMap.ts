import fs from 'node:fs/promises'
import path from 'node:path'
import { AMB, DLF, FTS, LLF } from 'arx-convert'
import {
  ArxLightFlags,
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
import type { Object3D } from 'three'
import { Audio } from '@src/Audio.js'
import { Entities } from '@src/Entities.js'
import { Entity } from '@src/Entity.js'
import { Fog } from '@src/Fog.js'
import { Fogs } from '@src/Fogs.js'
import { HUD } from '@src/HUD.js'
import { LevelLoader } from '@src/LevelLoader.js'
import { Light } from '@src/Light.js'
import { Lights } from '@src/Lights.js'
import { generateMetadata } from '@platform/node/MetaData.js'
import { Path } from '@src/Path.js'
import { Paths } from '@src/Paths.js'
import { Player } from '@src/Player.js'
import { Polygon } from '@src/Polygon.js'
import { type MeshImportProps, Polygons } from '@src/Polygons.js'
import { Portal } from '@src/Portal.js'
import { Rotation } from '@src/Rotation.js'
import { Script } from '@src/Script.js'
import { $ } from '@src/Selection.js'
import type { Settings } from '@platform/common/Settings.js'
import { Translations } from '@src/Translations.js'
import { UI } from '@src/UI.js'
import { Vector3 } from '@src/Vector3.js'
import { Zone } from '@src/Zone.js'
import { Zones } from '@src/Zones.js'
import { MapFinalizedError, MapNotFinalizedError } from '@src/errors.js'
import { groupSequences, times } from '@src/faux-ramda.js'
import { percentOf, exportToJSON, compressAs, encodeText, joinPath, isAbsolutePath } from '@src/helpers.js'
import type { FileExports, OriginalLevel } from '@src/types.js'
import { createPlaneMesh } from '@prefabs/mesh/plane.js'
import { Texture } from '@src/Texture.js'
import type { Vertex } from '@src/Vertex.js'
import { Color } from '@src/Color.js'

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

/**
 * @see https://github.com/arx/ArxLibertatis/blob/ArxFatalis-1.21/Sources/DANAE/Danae.cpp#L402
 */
const GLOBAL_LIGHT_FACTOR = 0.85

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

  private static async getGeneratorId(settings: Settings): Promise<string> {
    const generator = await settings.getGeneratorPackageJSON()
    return `${generator.name} - version ${generator.version}`
  }

  polygons: Polygons
  lights: Lights
  fogs: Fogs
  entities: Entities
  zones: Zones
  paths: Paths
  player: Player
  portals: Portal[] // TODO: create Portals class
  config: ArxMapConfig
  hud: HUD
  ui: UI
  i18n: Translations
  todo: ToBeSortedLater

  constructor(dlf?: ArxDLF, fts?: ArxFTS, llf?: ArxLLF, areNormalsCalculated = false) {
    this.polygons = new Polygons()
    this.lights = new Lights()
    this.fogs = new Fogs()
    this.entities = new Entities()
    this.zones = new Zones()
    this.paths = new Paths()
    this.player = new Player()
    this.portals = [] // TODO: create Portals class
    this.config = {
      isFinalized: false,
      offset: new Vector3(0, 0, 0),
    }
    this.hud = new HUD()
    this.ui = new UI()
    this.i18n = new Translations()
    this.todo = {
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

    if (dlf === undefined || fts === undefined || llf === undefined) {
      return
    }

    // ------- mapdata was given, load data from those variables -------

    this.player.orientation = Rotation.fromArxRotation(dlf.header.angleEdit)
    this.player.position = Vector3.fromArxVector3(dlf.header.posEdit)
    this.player.positionAlreadyAdjusted = true

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

  /**
   * @throws MapFinalizedError when trying to call finalize multiple times on the same ArxMap instance
   */
  finalize(settings: Settings): void {
    if (this.config.isFinalized) {
      throw new MapFinalizedError()
    }

    const removedPolygons = $(this.polygons).clearSelection().selectOutOfBounds().delete()

    if (removedPolygons.length > 0) {
      if (removedPolygons.length === 1) {
        console.warn(
          `[warning] ArxMap: Removed ${removedPolygons.length} polygon outside the 0..16000 boundary on the X or Z axis`,
        )
      } else {
        console.warn(
          `[warning] ArxMap: Removed ${removedPolygons.length} polygons outside the 0..16000 boundary on the X or Z axis`,
        )
      }
    }

    if (this.polygons.length === 0) {
      console.warn(`[warning] ArxMap: The map has no polygons, adding a quad below the player's feet`)
      this.addTileUnderThePlayersFeet()
      $(this.polygons).clearSelection().selectOutOfBounds().delete()
      if (this.polygons.length === 0) {
        console.warn(
          `[warning] ArxMap: Failed to add polygon below the player's feet as it was partially or fully outside the 0..16000 boundary on the X or Z axis. Try moving the player by adjusting map.player.position!`,
        )
      }
    }

    this.polygons.subdivideLargePolygons()

    this.polygons.forEach((polygon) => {
      polygon.calculateNormals()
      polygon.calculateArea()
    })

    this.calculateRoomData()

    this.calculateLighting(settings)

    if (!this.player.positionAlreadyAdjusted) {
      this.player.position.adjustToPlayerHeight()
    }

    this.config.isFinalized = true
  }

  /**
   * @throws MapFinalizedError when attempting to call the method on an already finalized map
   */
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

  /**
   * @throws MapNotFinalizedError when attempting to save an ArxMap which have not yet been finalized
   */
  async saveToDisk(settings: Settings, exportJsonFiles: boolean = false, prettify: boolean = false): Promise<void> {
    if (!this.config.isFinalized) {
      throw new MapNotFinalizedError()
    }

    console.log(`[info] ArxMap: seed = "${settings.seed}"`)
    console.log(`[info] ArxMap: output directory = "${settings.outputDir}"`)

    if (settings.manifest.uninstall !== undefined) {
      await settings.manifest.uninstall()
    }

    // assuming all targets here are relative to `settings.outputDir`
    //
    // `{ [target]: buffer }`
    //
    const filesToExport: Record<string, ArrayBufferLike> = {
      ...this.hud.exportSourcesAndTargets(settings),
    }

    // assuming sources to be relative (not start with /) if they are relative to settings.outputDir
    // and targets relative to `settings.outputDir`
    //
    // `{ [target]: source }`
    //
    let filesToCopy: FileExports = {
      ...this.ui.exportSourcesAndTargets(settings),
    }

    filesToCopy = {
      ...filesToCopy,
      ...(await this.polygons.exportTextures(settings)),
    }

    /*
    let otherDependencies: FileExports = {}
    */

    for (const entity of this.entities) {
      if (entity.hasScript()) {
        const filename = entity.exportScriptTarget(settings)
        const content = entity.script.toArxData().replaceAll('\n', Script.EOL)
        filesToExport[filename] = encodeText(content, 'latin9')

        filesToCopy = {
          ...filesToCopy,
          ...(await entity.script.exportTextures(settings)),
        }
      }

      if (entity.hasInventoryIcon()) {
        filesToCopy = {
          ...filesToCopy,
          ...(await entity.exportInventoryIcon(settings)),
        }
      }

      if (entity.hasModel()) {
        filesToCopy = {
          ...filesToCopy,
          ...(await entity.model.exportSourceAndTarget(settings, entity.src, exportJsonFiles, prettify)),
        }
      }

      for (const [tweakName, tweakModel] of Object.entries(entity.tweaks)) {
        filesToCopy = {
          ...filesToCopy,
          ...(await tweakModel.exportSourceAndTarget(settings, tweakName, exportJsonFiles, prettify)),
        }
      }

      filesToCopy = {
        ...filesToCopy,
        ...(await entity.exportOtherDependencies(settings)),
      }
    }

    if (this.player.hasScript()) {
      const filename = this.player.exportTarget()
      const content = this.player.script.toArxData().replaceAll('\n', Script.EOL)
      filesToExport[filename] = encodeText(content, 'latin9')

      filesToCopy = {
        ...filesToCopy,
        ...(await this.player.script.exportTextures(settings)),
      }
    }

    filesToCopy = {
      ...filesToCopy,
      ...Audio.exportReplacements(settings),
    }

    // ------------------------

    const translations = this.i18n.exportSourcesAndTargets(settings)

    const generatorId = await ArxMap.getGeneratorId(settings)
    const meta = await generateMetadata(settings)

    for (const [filename, translation] of Object.entries(translations)) {
      const content = `// ${meta.name} v.${meta.version} - ${generatorId}\n\n${translation}`
      filesToExport[filename] = encodeText(content, 'utf8')
    }

    // ------------------------

    let customAmbiences: Record<string, ArxAMB> = {}

    this.zones.forEach((zone) => {
      if (!zone.hasAmbience() || zone.ambience.isNative) {
        return
      }

      customAmbiences = {
        ...customAmbiences,
        ...zone.ambience.toArxData(),
      }

      filesToCopy = {
        ...filesToCopy,
        ...zone.ambience.exportSourcesAndTargets(),
      }
    })

    // ------------------------

    const { dlf, fts, llf } = await this.toArxData(settings)

    const binaryFts = FTS.save(fts, settings.uncompressedFTS === false)
    filesToExport[`game/graph/levels/level${settings.levelIdx}/fast.fts`] = compressAs(binaryFts, 'fts')

    const binaryDlf = DLF.save(dlf)
    filesToExport[`graph/levels/level${settings.levelIdx}/level${settings.levelIdx}.dlf`] = compressAs(binaryDlf, 'dlf')

    const binaryLlf = LLF.save(llf)
    filesToExport[`graph/levels/level${settings.levelIdx}/level${settings.levelIdx}.llf`] = compressAs(binaryLlf, 'llf')

    for (const [target, amb] of Object.entries(customAmbiences)) {
      const binaryAmb = AMB.save(amb)
      filesToExport[target] = compressAs(binaryAmb, 'amb')
    }

    // ------------------------

    // save json variants of binaries if needed
    if (exportJsonFiles) {
      const jsonFts = exportToJSON(fts, prettify)
      filesToExport[`game/graph/levels/level${settings.levelIdx}/fast.fts.json`] = jsonFts

      const jsonDlf = exportToJSON(dlf, prettify)
      filesToExport[`graph/levels/level${settings.levelIdx}/level${settings.levelIdx}.dlf.json`] = jsonDlf

      const jsonLlf = exportToJSON(llf, prettify)
      filesToExport[`graph/levels/level${settings.levelIdx}/level${settings.levelIdx}.llf.json`] = jsonLlf

      for (const [target, amb] of Object.entries(customAmbiences)) {
        const jsonAmb = exportToJSON(amb, prettify)
        filesToExport[target + '.json'] = jsonAmb
      }
    }

    // ------------------------

    // read contents of filesToCopy entries as ArrayBuffers and add them to filesToExport
    for (let target in filesToCopy) {
      let source = filesToCopy[target]

      if (!isAbsolutePath(source)) {
        source = joinPath(settings.assetsDir, source)
      }

      if (isAbsolutePath(target)) {
        // assuming that if target is absolute than it starts with settings.outputDir
        target = target.replace(settings.outputDir, '')
        if (target.startsWith('/')) {
          target = target.slice(1)
        }
      }

      const file = await fs.readFile(source)
      filesToExport[target] = file.buffer
    }

    // ------------------------

    // lastly create a manifest.json file with all the files that the level generator is exporting
    filesToExport['manifest.json'] = await settings.manifest.generate(Object.keys(filesToExport))

    // write the ArrayBuffers of filesToExport into files
    for (const target in filesToExport) {
      const data = filesToExport[target]
      const fullPath = joinPath(settings.outputDir, target)

      const dirname = path.dirname(fullPath)
      await fs.mkdir(dirname, { recursive: true })

      const wrappedData = new Uint8Array(data)
      await fs.writeFile(fullPath, wrappedData)
    }
  }

  adjustOffsetTo(map: ArxMap): void {
    const offsetDifference = map.config.offset.clone().sub(this.config.offset)
    $(this.polygons).selectAll().move(offsetDifference)
  }

  /**
   * @throws MapFinalizedError when attempting to call the method on an already finalized map
   */
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

  /**
   * @throws MapFinalizedError when attempting to call the method on an already finalized map
   */
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

  async toArxData(settings: Settings): Promise<{ dlf: ArxDLF; llf: ArxLLF; fts: ArxFTS }> {
    const now = Math.floor(Date.now() / 1000)
    const generatorId = await ArxMap.getGeneratorId(settings)

    const nonRootEntities = new Entities(
      ...this.entities.filter((entity) => {
        const isRoot = entity.hasScript() && entity.script.isRoot
        return !isRoot
      }),
    )

    const dlf: ArxDLF = {
      header: {
        lastUser: generatorId,
        time: now,
        posEdit: this.player.position.toArxData(),
        angleEdit: this.player.orientation.toArxData(),
        numberOfBackgroundPolygons: this.polygons.length,
      },
      scene: {
        levelIdx: settings.levelIdx,
      },
      ...this.fogs.toArxData(),
      ...this.paths.toArxData(),
      ...this.zones.toArxData(),
      ...nonRootEntities.toArxData(),
    }

    const fts: ArxFTS = {
      header: {
        levelIdx: settings.levelIdx,
      },
      uniqueHeaders: this.todo.uniqueHeaders,
      sceneHeader: {
        mScenePosition: this.config.offset.toArxData(),
      },
      cells: this.todo.cells,
      anchors: this.todo.anchors,
      portals: this.portals.map((portal) => {
        return portal.toArxData()
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

  private addTileUnderThePlayersFeet(): void {
    const playerRealPos = this.config.offset.clone().add(this.player.position)

    if (this.player.positionAlreadyAdjusted) {
      playerRealPos.sub(new Vector3(0, 0, 0).adjustToPlayerHeight())
    }

    const plane = createPlaneMesh({
      size: 100,
      tileSize: 100,
      texture: Texture.missingTexture,
    })
    plane.position.set(playerRealPos.x, playerRealPos.y, playerRealPos.z)

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
        return vertex.toArxData()
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

  // -----------------------------------

  // TODO: move lighting calculation stuff to its own place

  /**
   * @see https://github.com/arx/ArxLibertatis/blob/ArxFatalis-1.21/Sources/DANAE/Danae.cpp#L1035
   */
  private getDanaeAmbientColor(): Color {
    return new Color(percentOf(9, 255), percentOf(9, 255), percentOf(9, 255))
  }

  /**
   * @see https://github.com/arx/ArxLibertatis/blob/ArxFatalis-1.21/Sources/DANAE/ARX_Cedric.cpp#L1072
   */
  private calculateDanaeVertexColor(vertex: Vertex, normal: Vector3, lights: Light[]): void {
    vertex.color = this.getDanaeAmbientColor()

    // TODO: refactor this to make the variable names make more sense
    lights.forEach((light) => {
      const tl = light.position.clone().sub(vertex)
      const dista = tl.length()

      if (dista >= light.fallEnd) {
        return
      }

      const lightVector = tl.normalize()

      let cosangle = normal.x * lightVector.x + normal.y * lightVector.y + normal.z * lightVector.z

      // If light visible
      if (cosangle <= 0) {
        return
      }

      const precalc = light.intensity * GLOBAL_LIGHT_FACTOR
      const fallDiffMul = 1 / (light.fallEnd - light.fallStart)

      // Evaluate its intensity depending on the distance Light<->Object
      if (dista <= light.fallStart) {
        cosangle = cosangle * precalc
      } else {
        const p = (light.fallEnd - dista) * fallDiffMul

        if (p <= 0) {
          cosangle = 0
        } else {
          cosangle = cosangle * p * precalc
        }
      }

      vertex.color.add(light.color.clone().multiplyScalar(cosangle))
    })
  }

  private calculateMaxBrightnessLighting(): void {
    this.polygons.forEach((polygon) => {
      polygon.vertices[0].color = Color.white
      polygon.vertices[1].color = Color.white
      polygon.vertices[2].color = Color.white
      if (polygon.isQuad()) {
        polygon.vertices[3].color = Color.white
      }
    })
  }

  private calculateCompleteDarknessLighting(): void {
    this.polygons.forEach((polygon) => {
      polygon.vertices[0].color = Color.black
      polygon.vertices[1].color = Color.black
      polygon.vertices[2].color = Color.black
      if (polygon.isQuad()) {
        polygon.vertices[3].color = Color.black
      }
    })
  }

  private calculateArxLighting(): void {
    const lights = this.lights
      .filter((light) => {
        // https://github.com/arx/ArxLibertatis/blob/ArxFatalis-1.21/Sources/EERIE/EERIELight.cpp#L826
        // and
        // https://github.com/arx/ArxLibertatis/blob/ArxFatalis-1.21/Sources/EERIE/EERIELight.cpp#L158
        return (light.flags & ArxLightFlags.SemiDynamic) === 0
      })
      .map((light) => {
        const clonedLight = light.clone()
        clonedLight.position = clonedLight.position.clone().add(this.config.offset)
        return clonedLight
      })

    this.polygons.forEach((polygon) => {
      const { norm, norm2, normals, vertices } = polygon

      this.calculateDanaeVertexColor(vertices[0], normals?.[0] ?? norm, lights)
      this.calculateDanaeVertexColor(vertices[1], normals?.[1] ?? norm, lights)
      this.calculateDanaeVertexColor(vertices[2], normals?.[2] ?? norm, lights)

      if (polygon.isQuad()) {
        this.calculateDanaeVertexColor(vertices[3], normals?.[3] ?? norm2, lights)
      }
    })
  }

  private calculateRealisticLighting(): void {
    // TODO: implement this
    console.error(`[error] ArxMap: realistic lighting mode is not yet implemented`)
  }

  private calculateLighting(settings: Settings): void {
    if (!settings.calculateLighting || this.lights.length === 0) {
      return
    }

    switch (settings.lightingCalculatorMode) {
      case 'MaxBrightness': {
        this.calculateMaxBrightnessLighting()
        break
      }

      case 'CompleteDarkness': {
        this.calculateCompleteDarknessLighting()
        break
      }

      case 'Arx': {
        this.calculateArxLighting()
        break
      }

      case 'Realistic': {
        this.calculateRealisticLighting()
        break
      }
    }
  }
}
