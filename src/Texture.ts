import type { ArxTextureContainer } from 'arx-convert/types'
import { ClampToEdgeWrapping, Texture as ThreeJsTexture, UVMapping } from 'three'
import type { Simplify } from 'type-fest'
import { ExportBuiltinAssetError } from '@src/errors.js'
import { getFilenameFromPath } from '@src/helpers.js'

export type TextureExportData = {
  type: 'Texture'
  data: {
    needsToBeTileable: boolean
    dontCatchErrors: boolean
    isInternalAsset: boolean
    source: {
      filename: string
      path: string
    }
    target: {
      filename: string
      path: string
    }
  }
}

export type TextureConstructorProps = {
  filename: string

  /**
   * whether the texture is from the main game or a custom added file
   *
   * default value is `true` (meaning that the texture is from the game)
   */
  isNative?: boolean

  /**
   * This path is relative to the "assets" folder in the project that uses the arx-level-generator
   *
   * default value is `"graph/obj3d/texture"`
   */
  sourcePath?: string

  /**
   * Whether the asset is provided by the arx-level-generator
   *
   * default value is `false`
   */
  isInternalAsset?: boolean
}

export const NO_TEXTURE_CONTAINER = 0

/**
 * @see https://github.com/arx/ArxLibertatis/blob/ArxFatalis-1.21/Sources/EERIE/EERIETexture.cpp#L749
 */
export const supportedExtensions = ['.png', '.jpg', '.jpeg', '.bmp' /* , '.tga' */] as const

export type SupportedExtension = (typeof supportedExtensions)[number]

export function isSupportedExtension(input: any): input is SupportedExtension {
  return typeof input === 'string' && (supportedExtensions as readonly string[]).includes(input)
}

export class Texture extends ThreeJsTexture {
  static readonly targetPath = 'graph/obj3d/textures'

  static fromCustomFile(props: Simplify<Omit<TextureConstructorProps, 'isNative'>>): Texture {
    return new Texture({
      ...props,
      isNative: false,
    })
  }

  static fromArxTextureContainer(texture: ArxTextureContainer): Texture {
    return new Texture({
      filename: texture.filename,
    })
  }

  // ----------------

  static get alpha(): Texture {
    return new Texture({ filename: 'alpha.bmp' })
  }

  static get stoneHumanPaving(): Texture {
    return new Texture({ filename: '[stone]_human_paving.bmp' })
  }

  static get stoneHumanPaving1(): Texture {
    return new Texture({ filename: '[stone]_human_paving1.bmp' })
  }

  static get aliciaRoomMur01(): Texture {
    return new Texture({ filename: 'aliciaroom_mur01.jpg' })
  }

  static get aliciaRoomMur02(): Texture {
    return new Texture({ filename: 'aliciaroom_mur02.jpg' })
  }

  static get waterCavewater(): Texture {
    return new Texture({ filename: '(water)cavewater.jpg' })
  }

  static get l1DragonStoneGround01(): Texture {
    return new Texture({ filename: 'l1_dragon_[stone]_ground01.jpg' })
  }

  static get l1DragonIceGround08(): Texture {
    return new Texture({ filename: 'l1_dragon_[ice]_ground08.jpg' })
  }

  static get l1DragonSpideLime1Nocol(): Texture {
    return new Texture({ filename: 'L1_Dragon_[spide]_Lime1nocol.bmp' })
  }

  static get l1PrisonStoneGridl02(): Texture {
    return new Texture({ filename: 'l1_prison_(stone)_gridl02.bmp' })
  }

  static get l1PrisonSandGround01(): Texture {
    return new Texture({ filename: 'l1_prison_[sand]_ground01.jpg' })
  }

  static get l1TempleStoneWall03(): Texture {
    return new Texture({ filename: 'l1_temple_[stone]_wall03.jpg' })
  }

  static get l2CavesRustyItem01(): Texture {
    return new Texture({ filename: 'l2_caves_[rusty]_item01.jpg' })
  }

  static get l2TrollStoneGround04(): Texture {
    return new Texture({ filename: 'l2_troll_[stone]_ground04.jpg' })
  }

  static get l2TrollWoodPillar08(): Texture {
    return new Texture({ filename: 'l2_troll_[wood]_pillar08.jpg' })
  }

  static get l2GobelStoneFloor02(): Texture {
    return new Texture({ filename: 'l2_gobel_[stone]_floor02.jpg' })
  }

  static get l2GobelStoneCenter(): Texture {
    return new Texture({ filename: 'l2_gobel_[stone]_center.jpg' })
  }

  static get l3DissidWetGround01(): Texture {
    return new Texture({ filename: 'l3_dissid_[wet]_ground01.jpg' })
  }

  static get l3DissidStoneGround09(): Texture {
    return new Texture({ filename: 'l3_dissid_[stone]_ground09.jpg' })
  }

  static get l3DissidStoneGround10(): Texture {
    return new Texture({ filename: 'l3_dissid_[stone]_ground10.jpg' })
  }

  static get l3DissidIronWall02(): Texture {
    return new Texture({ filename: 'l3_dissid_[iron]_wall02.bmp' })
  }

  static get l3DissidStoneWall03(): Texture {
    return new Texture({ filename: 'l3_dissid_[stone]_wall03.jpg' })
  }

  static get l3DissidStoneTrans01(): Texture {
    return new Texture({ filename: 'l3_dissid_[stone]_trans01.jpg' })
  }

  static get l3DissidWoodFabric03(): Texture {
    return new Texture({ filename: 'l3_dissid_[wood]_fabric03.jpg' })
  }

  static get l3DissidWoodFabric04(): Texture {
    return new Texture({ filename: 'l3_dissid_[wood]_fabric04.jpg' })
  }

  static get l4YlsideStoneGround01(): Texture {
    return new Texture({ filename: 'l4_ylside_[stone]_ground01.jpg' })
  }

  static get l4DwarfIronBoard02(): Texture {
    return new Texture({ filename: 'l4_dwarf_[iron]_board02.jpg' })
  }

  static get l4DwarfWoodBoard02(): Texture {
    return new Texture({ filename: 'l4_dwarf_[wood]_board02.jpg' })
  }

  static get l5CavesGravelGround05(): Texture {
    return new Texture({ filename: 'l5_caves_[gravel]_ground05.jpg' })
  }

  static get l6RatmenFleshWall03(): Texture {
    return new Texture({ filename: 'l6_ratmen_[flesh]_wall03.jpg' })
  }

  static get l7DwarfMetalPlate10(): Texture {
    return new Texture({ filename: 'l7_dwarf_[metal]_plate10.jpg' })
  }

  static get stoneHumanStoneWall(): Texture {
    return new Texture({ filename: '[stone]_human_stone_wall.jpg' })
  }

  static get stoneHumanStoneWall1(): Texture {
    return new Texture({ filename: '[stone]_human_stone_wall1.jpg' })
  }

  static get stoneHumanStoneWall2(): Texture {
    return new Texture({ filename: '[stone]_human_stone_wall2.jpg' })
  }

  static get stoneHumanAkbaa2F(): Texture {
    return new Texture({ filename: '[stone]_human_akbaa2_f.jpg' })
  }

  static get stoneHumanAkbaa4F(): Texture {
    return new Texture({ filename: '[stone]_human_akbaa4_f.jpg' })
  }

  static get stoneHumanPriest4(): Texture {
    return new Texture({ filename: '[stone]_human_priest4.jpg' })
  }

  static get itemFishingPole2(): Texture {
    return new Texture({ filename: 'item_fishing pole2.bmp' })
  }

  static get itemRope(): Texture {
    return new Texture({ filename: 'item_rope.bmp' })
  }

  static get fixinterHeavyCatacombDoor(): Texture {
    return new Texture({ filename: 'fixinter_heavy_catacomb_door.bmp' })
  }

  static get stoneGroundCavesWet05(): Texture {
    return new Texture({ filename: '[stone]_ground_caves_wet05' })
  }

  static get glassGlass01(): Texture {
    return new Texture({ filename: '[glass]_glass01.jpg' })
  }

  static get itemCheese(): Texture {
    return new Texture({ filename: 'item_cheese.jpg' })
  }

  static get itemRuneAam(): Texture {
    return new Texture({ filename: 'item_rune_aam' })
  }

  static get missingTexture(): Texture {
    return Texture.fromCustomFile({
      filename: 'jorge-[stone].jpg',
      sourcePath: 'textures',
      isInternalAsset: true,
    })
  }

  static get uvDebugTexture(): Texture {
    return Texture.fromCustomFile({
      filename: 'uv-reference-map-[stone].jpg',
      sourcePath: 'textures',
      isInternalAsset: true,
    })
  }

  static get missingInventoryIcon(): Texture {
    return Texture.fromCustomFile({
      filename: 'missing[icon].bmp',
      sourcePath: 'ui',
      isInternalAsset: true,
    })
  }

  // ----------------

  filename: string
  isNative: boolean
  sourcePath?: string
  isInternalAsset: boolean

  constructor(props: TextureConstructorProps) {
    super(undefined, UVMapping, ClampToEdgeWrapping, ClampToEdgeWrapping)

    this.filename = props.filename
    this.isNative = props.isNative ?? true
    this.sourcePath = props.sourcePath
    this.isInternalAsset = props.isInternalAsset ?? false

    // this.alreadyMadeTileable = false
  }

  exportState(): TextureConstructorProps {
    return {
      filename: this.filename,
      isNative: this.isNative,
      sourcePath: this.sourcePath,
      isInternalAsset: this.isInternalAsset,
    }
  }

  /**
   * Compares filenames of textures.
   *
   * Comparision is case-**insensitive** and ignores file extensions!
   *
   * @example
   * `texture.jpg` == `TEXTURE.JPG`
   *
   * @example
   * `texture.bmp` == `texture.jpg`
   *
   * @see https://github.com/arx/ArxLibertatis/blob/ArxFatalis-1.21/Sources/EERIE/EERIETexture.cpp#L749
   */
  equals(texture: Texture | string): boolean {
    const aPath = this.filename.toLowerCase()

    let bPath: string
    if (typeof texture === 'string') {
      bPath = texture.toLowerCase()
    } else {
      bPath = texture.filename.toLowerCase()
    }

    const aFilename = getFilenameFromPath(aPath)
    const bFilename = getFilenameFromPath(bPath)

    return aFilename === bFilename
  }

  equalsAny(textures: (Texture | string)[]): boolean {
    if (textures.length === 0) {
      return false
    }

    return textures.some((texture) => {
      return this.equals(texture)
    })
  }

  clone(): this {
    const copy = new Texture(this.exportState())
    return copy as this
  }

  /**
   * default value for `needsToBeTileable` is false
   *
   * @throws `ExportBuiltinAssetError` when trying to export a Texture that's built into the base game
   */
  getExportData(needsToBeTileable: boolean = false, dontCatchErrors: boolean = false): TextureExportData {
    if (this.isNative) {
      throw new ExportBuiltinAssetError()
    }

    return {
      type: 'Texture',
      data: {
        needsToBeTileable,
        dontCatchErrors,
        isInternalAsset: this.isInternalAsset,
        source: {
          filename: this.filename,
          path: this.sourcePath ?? Texture.targetPath,
        },
        target: {
          filename: this.filename,
          path: Texture.targetPath,
        },
      },
    }
  }
}
