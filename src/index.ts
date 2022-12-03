import { ArxFTS } from 'arx-level-json-converter/dist/fts/FTS'
import { ArxVertex } from 'arx-level-json-converter/dist/fts/Vertex'
import { ArxPolygonFlags } from 'arx-level-json-converter/dist/common/constants'
import path from 'path'
import { times } from './faux-ramda'

const { OUTPUTDIR = path.resolve('./dist'), LEVEL = 1 } = process.env

const fts: ArxFTS = {
  meta: {
    type: 'fts',
    numberOfLeftoverBytes: 0,
  },
  header: {
    path: `C:\\ARX\\Game\\Graph\\Levels\\level${LEVEL}\\`,
    version: 0.141,
  },
  uniqueHeaders: [],
  sceneHeader: {
    version: 0.141,
    sizeX: 160,
    sizeZ: 160,
    numberOfPolygons: 0,
    playerPosition: { x: 0, y: 0, z: 0 },
    mScenePosition: { x: 0, y: 0, z: 0 },
  },
  textureContainers: [],
  cells: times((): { anchors: number[] } => ({ anchors: [] }), 160 * 160),
  polygons: [],
  anchors: [],
  portals: [],
  rooms: [],
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

fts.polygons.push({
  vertices: [
    { x: 0, y: 0, z: 0, u: 0, v: 0 } as ArxVertex,
    { x: 1, y: 0, z: 0, u: 0, v: 1 } as ArxVertex,
    { x: 0, y: 0, z: 1, u: 1, v: 0 } as ArxVertex,
    { x: 1, y: 0, z: 1, u: 1, v: 1 } as ArxVertex,
  ],
  tex: 0, // make a constant for 0, as it means no texture

  // TODO: calculate normals from vertices
  norm: [],
  norm2: [],
  normals: [],

  transval: 0,
  area: 1,
  type: ArxPolygonFlags.Quad | ArxPolygonFlags.NoDraw,
  room: 1,
  paddy: 0,
})
