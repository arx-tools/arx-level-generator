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
import { Color } from '@src/Color.js'
import { Entities } from '@src/Entities.js'
import { Entity } from '@src/Entity.js'
import { Fog } from '@src/Fog.js'
import { Fogs } from '@src/Fogs.js'
import { HUD } from '@src/HUD.js'
import { LevelLoader } from '@src/LevelLoader.js'
import { Light } from '@src/Light.js'
import { Lights } from '@src/Lights.js'
import { Manifest } from '@src/Manifest.js'
import { Path } from '@src/Path.js'
import { Paths } from '@src/Paths.js'
import { Player } from '@src/Player.js'
import { Polygon } from '@src/Polygon.js'
import { type MeshImportProps, Polygons } from '@src/Polygons.js'
import { Portal } from '@src/Portal.js'
import { Rotation } from '@src/Rotation.js'
import { Script } from '@src/Script.js'
import { $ } from '@src/Selection.js'
import { Texture } from '@src/Texture.js'
import { Translations } from '@src/Translations.js'
import { UI } from '@src/UI.js'
import { Vector3 } from '@src/Vector3.js'
import type { Vertex } from '@src/Vertex.js'
import { Zone } from '@src/Zone.js'
import { Zones } from '@src/Zones.js'
import { MapFinalizedError, MapNotFinalizedError } from '@src/errors.js'
import { groupSequences, times } from '@src/faux-ramda.js'
import { percentOf, encodeJSON, compressAs, encodeText } from '@src/helpers.js'
import type { OriginalLevel } from '@src/types.js'
import type { IODiff } from '@platform/common/Platform.js'
import type { Settings } from '@platform/common/Settings.js'
import { generateMetadata } from '@platform/node/metadata.js'
import { getGeneratorPackageJSON } from '@platform/node/package.js'
import { createPlaneMesh } from '@prefabs/mesh/plane.js'

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

// used by lighting calculation - TODO: move this with the rest of the lighting calculation code to a separate file
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

  private static async getGeneratorId(): Promise<string> {
    const generator = await getGeneratorPackageJSON()
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
   * Make necessary optimizations and cleanups before the map data can be considered ready to be exported.
   * The optimizations make irreversible changes to the polygons and other parts of the code, so this method
   * should be called at the very end.
   *
   * The following optimizations are made:
   *
   * 1. removes polygons that are out of bounds (outside the 0..16000 boundary on either or both the X or Z axis)
   * 1. adds a quad below the player's feet if the map has 0 polygons
   * 1. subdivides large polygons -- TODO: implement this
   * 1. calculates normals and "area" of polygons
   * 1. calculates which cells polygons belong into
   * 1. sorts polygons based on what "room" they are in
   * 1. bakes lighting information from static lights into polygons (calculate vertex lighting)
   * 1. fixes the issue of player sinking into ground (more info in `Vector3.adjustToPlayerHeight()`)
   *
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
          `[warning] ArxMap: Removed ${removedPolygons.length} polygon that is partially or fully outside the 0(inclusive)..16000(exclusive) boundary on either or both the X or Z axis.`,
        )
      } else {
        console.warn(
          `[warning] ArxMap: Removed ${removedPolygons.length} polygons that is partially or fully outside the 0(inclusive)..16000(exclusive) boundary on either or both the X or Z axis.`,
        )
      }
    }

    // prettier-ignore
    if (this.polygons.length === 0) {
      const playerRealPos = this.getPlayerRealPos()

      console.warn(`[warning] ArxMap: The map has no polygons, adding a 100x100 polygon quad below the player's feet...`)
      console.warn(`   [info] ArxMap: Current player position is at:`)
      console.warn(`   [info] ArxMap: X = ${playerRealPos.x} = ${this.config.offset.x} (map.config.offset.x) + ${this.player.position.x} (map.player.position.x)`)
      console.warn(`   [info] ArxMap: Z = ${playerRealPos.z} = ${this.config.offset.z} (map.config.offset.z) + ${this.player.position.z} (map.player.position.z)`)

      this.addTileUnderThePlayersFeet()
      $(this.polygons).clearSelection().selectOutOfBounds().delete()
      if (this.polygons.length === 0) {
        console.warn(`[warning] ArxMap: Failed to add a 100x100 polygon quad below the player's feet at ${playerRealPos.x - 50}/${playerRealPos.z - 50} as it was partially or fully outside the 0(inclusive)..16000(exclusive) boundary on the X or Z axis.`)
        console.warn(`   [info] ArxMap: Try moving the player by adjusting map.player.position relative to map.config.offset so that the player is within the 50(inclusive)..15950(exclusive) range accounting the offset of the quad that is placed from -50/-50 to 50/50 relative to the player's position.`)
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

    this.movePolygonsToTheSameRoom()
  }

  /**
   * @throws MapNotFinalizedError when attempting to save an ArxMap which have not yet been finalized
   */
  async export(settings: Settings, exportJsonFiles: boolean = false, prettify: boolean = false): Promise<IODiff> {
    if (!this.config.isFinalized) {
      throw new MapNotFinalizedError()
    }

    const files: IODiff = {
      toAdd: {},
      toCopy: {},
      toRemove: [],
    }

    console.log(`[info] ArxMap: seed = "${settings.seed}"`)
    console.log(`[info] ArxMap: output directory = "${settings.outputDir}"`)

    const manifest = new Manifest(settings)

    files.toRemove.push(...(await manifest.getFilesFromManifestJSON()))

    files.toAdd = {
      ...files.toAdd,
      ...this.hud.exportSourcesAndTargets(settings),
    }

    files.toCopy = {
      ...this.ui.exportSourcesAndTargets(settings),
      ...(await this.polygons.exportTextures(settings)),
      ...Audio.exportReplacements(settings),
    }

    for (const entity of this.entities) {
      if (entity.hasScript()) {
        const filename = entity.exportScriptTarget(settings)
        const content = entity.script.toArxData().replaceAll('\n', Script.EOL)
        files.toAdd[filename] = encodeText(content, 'latin9')

        files.toCopy = {
          ...files.toCopy,
          ...(await entity.script.exportTextures(settings)),
        }
      }

      if (entity.hasInventoryIcon()) {
        files.toCopy = {
          ...files.toCopy,
          ...(await entity.exportInventoryIcon(settings)),
        }
      }

      if (entity.hasModel()) {
        files.toCopy = {
          ...files.toCopy,
          ...(await entity.model.exportSourceAndTarget(settings, entity.src, exportJsonFiles, prettify)),
        }
      }

      for (const [tweakName, tweakModel] of Object.entries(entity.tweaks)) {
        files.toCopy = {
          ...files.toCopy,
          ...(await tweakModel.exportSourceAndTarget(settings, tweakName, exportJsonFiles, prettify)),
        }
      }

      files.toCopy = {
        ...files.toCopy,
        ...(await entity.exportOtherDependencies(settings)),
      }
    }

    if (this.player.hasScript()) {
      const filename = this.player.exportTarget(settings)
      const content = this.player.script.toArxData().replaceAll('\n', Script.EOL)
      files.toAdd[filename] = encodeText(content, 'latin9')

      files.toCopy = {
        ...files.toCopy,
        ...(await this.player.script.exportTextures(settings)),
      }
    }

    // ------------------------

    const generatorId = await ArxMap.getGeneratorId()
    const meta = await generateMetadata(settings)

    const translations = this.i18n.exportSourcesAndTargets(settings)

    for (const [filename, translation] of Object.entries(translations)) {
      const content = `// ${meta.name} v.${meta.version} - ${generatorId}\n\n${translation}`
      files.toAdd[filename] = encodeText(content, 'utf8')
    }

    let customAmbiences: Record<string, ArxAMB> = {}

    this.zones.forEach((zone) => {
      if (!zone.hasAmbience() || zone.ambience.isNative) {
        return
      }

      customAmbiences = {
        ...customAmbiences,
        ...zone.ambience.toArxData(settings),
      }

      files.toCopy = {
        ...files.toCopy,
        ...zone.ambience.exportSourcesAndTargets(settings),
      }
    })

    // ------------------------

    const { dlf, fts, llf } = await this.toArxData(settings)

    const binaryFts = FTS.save(fts, settings.uncompressedFTS === false)
    const binaryFtsFilename = path.resolve(settings.outputDir, `game/graph/levels/level${settings.levelIdx}/fast.fts`)
    files.toAdd[binaryFtsFilename] = compressAs(binaryFts, 'fts')

    const binaryDlf = DLF.save(dlf)
    const binaryDlfFilename = path.resolve(
      settings.outputDir,
      `graph/levels/level${settings.levelIdx}/level${settings.levelIdx}.dlf`,
    )
    files.toAdd[binaryDlfFilename] = compressAs(binaryDlf, 'dlf')

    const binaryLlf = LLF.save(llf)
    const binaryLlfFilename = path.resolve(
      settings.outputDir,
      `graph/levels/level${settings.levelIdx}/level${settings.levelIdx}.llf`,
    )
    files.toAdd[binaryLlfFilename] = compressAs(binaryLlf, 'llf')

    for (const [target, amb] of Object.entries(customAmbiences)) {
      const binaryAmb = AMB.save(amb)
      files.toAdd[target] = compressAs(binaryAmb, 'amb')
    }

    // ------------------------
    // save variants of binaries as json if needed

    if (exportJsonFiles) {
      const jsonFts = encodeJSON(fts, prettify)
      const jsonFtsFilename = path.resolve(
        settings.outputDir,
        `game/graph/levels/level${settings.levelIdx}/fast.fts.json`,
      )
      files.toAdd[jsonFtsFilename] = jsonFts

      const jsonDlf = encodeJSON(dlf, prettify)
      const jsonDlfFilename = path.resolve(
        settings.outputDir,
        `graph/levels/level${settings.levelIdx}/level${settings.levelIdx}.dlf.json`,
      )
      files.toAdd[jsonDlfFilename] = jsonDlf

      const jsonLlf = encodeJSON(llf, prettify)
      const jsonLlfFilename = path.resolve(
        settings.outputDir,
        `graph/levels/level${settings.levelIdx}/level${settings.levelIdx}.llf.json`,
      )
      files.toAdd[jsonLlfFilename] = jsonLlf

      for (const [target, amb] of Object.entries(customAmbiences)) {
        const jsonAmb = encodeJSON(amb, prettify)
        files.toAdd[target + '.json'] = jsonAmb
      }
    }

    // ------------------------
    // lastly create manifest.json

    const sortedFileList = [...Object.keys(files.toCopy), ...Object.keys(files.toAdd)]
    sortedFileList.sort()
    const [manifestData, manifestTarget] = await manifest.generate(sortedFileList)
    files.toAdd[manifestTarget] = manifestData

    return files
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

  /**
   * Generates DLF, LLF and FTS datas in a formats that can be given to `arx-convert`
   */
  async toArxData(settings: Settings): Promise<{ dlf: ArxDLF; llf: ArxLLF; fts: ArxFTS }> {
    const now = Math.floor(Date.now() / 1000)
    const generatorId = await ArxMap.getGeneratorId()

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
      ...nonRootEntities.toArxData(),
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

  private getPlayerRealPos(): Vector3 {
    return this.config.offset.clone().add(this.player.position)
  }

  private addTileUnderThePlayersFeet(): void {
    const playerRealPos = this.getPlayerRealPos()

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

  private movePolygonsToTheSameRoom(): void {
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

  // -----------------------------------
  // Lighting calculation methods - Work in progress, it should eventually go into a separate file or files

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

    throw new Error(`realistic lighting mode is not yet implemented`)
  }

  /**
   * Bakes lighting information from static lights into polygons (calculates vertex lighting)
   *
   * @see http://www.hourences.com/tutorials-vtx-lighting/
   */
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
