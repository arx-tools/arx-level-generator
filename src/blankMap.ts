import { DlfInteractiveObject } from './assets/items'
import { MAP_MAX_WIDTH, MAP_MAX_HEIGHT } from './constants'
import { PosVertex3, RgbaBytes } from './types'
import { ArxColor, ArxRotation, ArxVector3 } from 'arx-level-json-converter/types/binary/BinaryIO'

export type Meta = {
  type: string
  numberOfLeftoverBytes: number
}

type Pathway = {
  rpos: ArxVector3
  flag: number
  time: number
}

export type ZoneData = {
  header: {
    name: string
    idx: number
    flags: number
    initPos: ArxVector3
    pos: ArxVector3
    rgb: ArxColor
    farClip: number
    reverb: number
    ambianceMaxVolume: number
    height: number
    ambiance: string
  }
  pathways: Pathway[]
}

export type DlfData = {
  meta: Meta
  header: {
    version: number
    identifier: 'DANAE_FILE'
    lastUser: string
    time: number
    posEdit: ArxVector3
    angleEdit: ArxRotation
    numberOfNodes: number
    numberOfNodeLinks: number
    numberOfZones: number
    lighting: number
    numberOfBackgroundPolygons: number
    numberOfIgnoredPolygons: number
    numberOfChildPolygons: number
    offset: ArxVector3
  }
  scene: {
    name: string
  }
  interactiveObjects: DlfInteractiveObject[]
  colors: null
  lights: any[] // TODO
  fogs: any[] // TODO
  paths: ZoneData[] // TODO
}

export const createDlfData = (level: number, now: number): DlfData => ({
  meta: {
    type: 'dlf',
    numberOfLeftoverBytes: 0,
  },
  header: {
    version: 1.44,
    identifier: 'DANAE_FILE',
    lastUser: 'generator',
    time: now,
    posEdit: {
      x: 0,
      y: 0,
      z: 0,
    },
    angleEdit: {
      a: 0,
      b: 0,
      g: 0,
    },
    numberOfNodes: 0,
    numberOfNodeLinks: 0,
    numberOfZones: 0,
    lighting: 0,
    numberOfBackgroundPolygons: 0,
    numberOfIgnoredPolygons: 0,
    numberOfChildPolygons: 0,
    offset: {
      x: 0,
      y: 0,
      z: 0,
    },
  },
  scene: {
    name: `Graph\\Levels\\level${level}\\`,
  },
  interactiveObjects: [],
  colors: null,
  lights: [],
  fogs: [],
  paths: [],
})

export type RoomDistance = {
  distance: number
  startPosition: ArxVector3
  endPosition: ArxVector3
}

export type FtsPolygon = {
  config: {
    color: RgbaBytes
    isQuad: boolean
    bumpable: boolean
  }
  vertices: PosVertex3[]
  tex: number
  transval: number
  area: number
  type: number
  room: number
  paddy: 0
  norm?: ArxVector3
  norm2?: ArxVector3
  normals?: [ArxVector3, ArxVector3, ArxVector3, ArxVector3]
}

export type FtsData = {
  meta: Meta
  header: {
    path: string
    version: number
  }
  uniqueHeaders: any[] // TODO
  sceneHeader: {
    version: number
    sizeX: number
    sizeZ: number
    playerPosition: ArxVector3
    mScenePosition: ArxVector3
  }
  polygons: Record<string, FtsPolygon[]> & { global: FtsPolygon[] }
  textureContainers: any[] // TODO
  cells: { anchors: any[] }[] // TODO
  anchors: any[] // TODO
  portals: any[] // TODO
  roomDistances: RoomDistance[]
}

export const createFtsData = (level: number) => {
  const fts: FtsData = {
    meta: {
      type: 'fts',
      numberOfLeftoverBytes: 0,
    },
    header: {
      path: `C:\\ARX\\Game\\Graph\\Levels\\level${level}\\`,
      version: 0.141,
    },
    uniqueHeaders: [],
    sceneHeader: {
      version: 0.141,
      sizeX: MAP_MAX_WIDTH,
      sizeZ: MAP_MAX_HEIGHT,
      // player position doesn't seem to do anything - if you want to move the player
      // set mScenePosition
      playerPosition: {
        x: 0,
        y: 0,
        z: 0,
      },
      mScenePosition: {
        x: 0,
        y: 0,
        z: 0,
      },
    },
    polygons: {
      global: [],
    },
    textureContainers: [],
    cells: [],
    anchors: [],
    portals: [],
    roomDistances: [
      {
        distance: -1,
        startPosition: {
          x: 0,
          y: 0,
          z: 0,
        },
        endPosition: {
          x: 1,
          y: 0,
          z: 0,
        },
      },
      {
        distance: -1,
        startPosition: {
          x: 0,
          y: 0,
          z: 0,
        },
        endPosition: {
          x: 0,
          y: 1,
          z: 0,
        },
      },
      {
        distance: -1,
        startPosition: {
          x: 0.984375,
          y: 0.984375,
          z: 0,
        },
        endPosition: {
          x: 0,
          y: 0,
          z: 0,
        },
      },
      {
        distance: -1,
        startPosition: {
          x: 0,
          y: 0,
          z: 0,
        },
        endPosition: {
          x: 0,
          y: 0,
          z: 0,
        },
      },
    ],
  }

  for (let i = 0; i < MAP_MAX_WIDTH * MAP_MAX_HEIGHT; i++) {
    fts.cells.push({ anchors: [] })
  }

  return fts
}

export type LightData = {
  pos: ArxVector3
  rgb: ArxColor
  fallstart: number
  fallend: number
  intensity: number
  i: 0
  exFlicker: ArxColor
  exRadius: number
  exFrequency: number
  exSize: number
  exSpeed: number
  exFlareSize: number
  extras: number
}

export type LlfData = {
  meta: Meta
  header: {
    version: number
    identifier: string
    lastUser: string
    time: number
    numberOfShadowPolygons: number
    numberOfIgnoredPolygons: number
    numberOfBackgroundPolygons: number
  }
  lights: LightData[]
  colors: RgbaBytes[]
}

export const createLlfData = (now: number): LlfData => ({
  meta: {
    type: 'llf',
    numberOfLeftoverBytes: 0,
  },
  header: {
    version: 1.44,
    identifier: 'DANAE_LLH_FILE',
    lastUser: 'generator',
    time: now,
    numberOfShadowPolygons: 0,
    numberOfIgnoredPolygons: 0,
    numberOfBackgroundPolygons: 0,
  },
  lights: [],
  colors: [],
})
