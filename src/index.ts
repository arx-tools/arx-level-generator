import { ArxFTS } from 'arx-level-json-converter/dist/fts/FTS'
import { ArxVertex } from 'arx-level-json-converter/dist/fts/Vertex'
import { ArxPolygonFlags } from 'arx-level-json-converter/dist/common/constants'
import path from 'path'
import { times } from './faux-ramda'
import { Triangle } from 'three'
import { Vector3 } from './Vector3'

const { OUTPUTDIR = path.resolve('./dist'), LEVEL = 1 } = process.env

const fts: ArxFTS = {
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

// -------------------

const isQuad = true
const polygonVertices: [ArxVertex, ArxVertex, ArxVertex, ArxVertex] = [
  { x: 0, y: 0, z: 0, u: 0, v: 0 },
  { x: 1, y: 0, z: 0, u: 0, v: 1 },
  { x: 0, y: 0, z: 1, u: 1, v: 0 },
  { x: 1, y: 0, z: 1, u: 1, v: 1 },
]

const [a, b, c, d] = polygonVertices

const triangle = new Triangle(new Vector3(a.x, a.y, a.z), new Vector3(b.x, b.y, b.z), new Vector3(c.x, c.y, c.z))
const norm = new Vector3()
triangle.getNormal(norm)

const norm2: Vector3 = new Vector3(0, 0, 0)
if (isQuad) {
  const triangle2 = new Triangle(new Vector3(d.x, d.y, d.z), new Vector3(b.x, b.y, b.z), new Vector3(c.x, c.y, c.z))
  triangle2.getNormal(norm2)
}

const NO_TEXTURE = 0

fts.polygons.push({
  vertices: polygonVertices,
  tex: NO_TEXTURE,
  norm: norm.toArxVector3(),
  norm2: norm2.toArxVector3(),
  normals: [norm.toArxVector3(), norm.toArxVector3(), norm.toArxVector3(), norm2.toArxVector3()],
  transval: 0,
  area: 1,
  type: ArxPolygonFlags.Quad | ArxPolygonFlags.NoDraw,
  room: 1,
  paddy: 0,
})
