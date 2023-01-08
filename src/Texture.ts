import path from 'node:path'
import { ArxTextureContainer } from 'arx-convert/types'
import { ClampToEdgeWrapping, Texture as ThreeJsTextue, UVMapping, MathUtils } from 'three'

type TextureConstructorProps = {
  filename: string
  isNative?: boolean
  width?: number
  height?: number
  sourcePath?: string
}

export class Texture extends ThreeJsTextue {
  filename: string
  isNative: boolean
  width: number
  height: number
  sourcePath?: string

  static humanPaving1 = Object.freeze(
    new Texture({
      filename: '[STONE]_HUMAN_PAVING1.BMP',
    }),
  )

  static l3DissidWall02 = Object.freeze(
    new Texture({
      filename: 'L3_Dissid_[iron]_wall02.bmp',
      width: 64,
      height: 64,
    }),
  )

  static aliciaRoomMur02 = Object.freeze(
    new Texture({
      filename: 'ALICIAROOM_MUR02.jpg',
    }),
  )

  constructor(props: TextureConstructorProps) {
    super(undefined, UVMapping, ClampToEdgeWrapping, ClampToEdgeWrapping)
    this.filename = props.filename
    this.isNative = props.isNative ?? true
    this.sourcePath = props.sourcePath

    // TODO: if size not given and !isNative, then try reading it from the file itself
    this.width = props.width ?? 128
    this.height = props.height ?? 128
  }

  static getTargetPath() {
    return 'GRAPH\\OBJ3D\\TEXTURES\\'
  }

  static fromArxTextureContainer(texture: ArxTextureContainer) {
    return new Texture({
      filename: texture.filename.replace(Texture.getTargetPath(), ''),
    })
  }

  isTileable() {
    return this.width === this.height && MathUtils.isPowerOfTwo(this.width)
  }

  exportSourceAndTarget(outputDir: string = ''): [string, string] {
    if (this.isNative) {
      throw new Error('trying to export copying information for a native texture')
    }

    const source = path.resolve('assets', this.sourcePath ?? 'graph/obj3d/textures', this.filename)
    const target = path.resolve(outputDir, 'graph/obj3d/textures', this.filename)

    return [source, target]
  }
}

export const NO_TEXTURE = 0
