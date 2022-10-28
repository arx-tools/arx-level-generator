import { clone, uniq } from '../faux-ramda'
import { MapData } from '../helpers'
import { getRootPath } from '../rootpath'
import { POLY_QUAD, POLY_TRANS, POLY_NO_SHADOW, POLY_WATER } from '../constants'

export type TextureDefinition = {
  src: string
  native: boolean
  width?: number
  height?: number
  path?: string
  flags?: number
}

export type Texture = TextureDefinition

export const textures = {
  none: null,
  ground: {
    gravel: {
      src: 'L5_CAVES_[GRAVEL]_GROUND05.jpg',
      native: true,
    },
    moss: {
      src: 'L1_MOSS01.jpg',
      native: true,
    },
    mossBorder: {
      src: 'L1_MOSS_BORDER02.jpg',
      native: true,
    },
    rock: {
      src: 'L1_DRAGON_[STONE]_GROUND03.jpg',
      native: true,
    },
  },
  wood: {
    aliciaRoomMur02: {
      src: '[WOOD]_ALICIAROOM_MUR02.jpg',
      native: true,
    },
    logs: {
      src: 'L2_TROLLS_[WOOD]_PILLAR.jpg',
      native: true,
    },
  },
  wall: {
    roughcast: [
      {
        src: '[WOOD]_HUMAN_ROUGHCAST_WALL.jpg',
        native: true,
      },
      {
        src: '[WOOD]_HUMAN_ROUGHCAST_WALL2.jpg',
        native: true,
      },
      {
        src: '[WOOD]_HUMAN_ROUGHCAST_WALL3.jpg',
        native: true,
      },
    ],
    castle: {
      src: '[STONE]_HUMAN_WALL8.jpg',
      native: true,
    },
  },
  window: {
    src: '[GLASS]_WINDOWS.jpg',
    native: true,
  },
  stone: {
    roof: {
      src: '[STONE]_HUMAN_ROOF.jpg',
      native: true,
    },
    humanWall1: {
      src: '[STONE]_HUMAN_STONE_WALL1.jpg',
      native: true,
    },
    akbaa4f: {
      src: '[STONE]_HUMAN_AKBAA4_F.jpg',
      native: true,
    },
    templeWallBase: {
      src: '[STONE]_HUMAN_PRIEST11.jpg',
      native: true,
    },
    templeWall: [
      {
        src: '[STONE]_HUMAN_PRIEST2.jpg',
        native: true,
      },
      {
        src: '[STONE]_HUMAN_PRIEST3.jpg',
        native: true,
      },
      {
        src: '[STONE]_HUMAN_PRIEST4.jpg',
        native: true,
      },
    ],
    templeWallEdge: {
      src: '[STONE]_HUMAN_PRIEST5.jpg',
      native: true,
    },
    stairs: {
      src: '[STONE]_HUMAN_STONE_ORNAMENT.jpg',
      native: true,
      width: 256,
      height: 256,
    },
    humanAkbaaPavingF: {
      src: '[STONE]_HUMAN_AKBAA_PAVING_F.jpg',
      native: true,
      width: 256,
      height: 256,
    },
    stone: [
      {
        src: '[STONE]_ROCK1_A.jpg',
        native: true,
      },
    ],
    bricks: {
      src: 'L3_HUMAN_[STONE]_CEILING01.jpg',
      native: true,
    },
  },
  skybox: {
    top: {
      src: 'skybox_01_top.jpg',
      native: false,
    },
    left: {
      src: 'skybox_01_left.jpg',
      native: false,
    },
    right: {
      src: 'skybox_01_right.jpg',
      native: false,
    },
    front: {
      src: 'skybox_01_front.jpg',
      native: false,
    },
    back: {
      src: 'skybox_01_back.jpg',
      native: false,
    },
    bottom: {
      src: 'skybox_01_bottom.jpg',
      native: false,
    },
  },
  backrooms: {
    wall: {
      path: 'projects/the-backrooms/textures',
      src: 'backrooms-[stone]-wall.jpg',
      native: false,
    },
    wall2: {
      path: 'projects/the-backrooms/textures',
      src: 'backrooms-[stone]-wall2.jpg',
      native: false,
    },
    wallRail: {
      path: 'projects/the-backrooms/textures',
      src: 'backrooms-[stone]-wall2.jpg',
      native: false,
    },
    carpet: {
      path: 'projects/the-backrooms/textures',
      src: 'backrooms-[fabric]-carpet.jpg',
      native: false,
    },
    carpetDirty: {
      path: 'projects/the-backrooms/textures',
      src: 'backrooms-[fabric]-carpet-dirty.jpg',
      native: false,
    },
    carpet2: {
      path: 'projects/the-backrooms/textures',
      src: 'backrooms-[fabric]-carpet2.jpg',
      native: false,
    },
    ceiling: {
      path: 'projects/the-backrooms/textures',
      src: 'backrooms-[stone]-ceiling-tile.jpg',
      native: false,
    },
    ceilingDiffuser: {
      path: 'projects/the-backrooms/textures',
      src: 'backrooms-[metal]-ceiling-air-diffuser.jpg',
      native: false,
    },
    ceilingLampOn: {
      path: 'projects/the-backrooms/textures',
      src: 'backrooms-[metal]-light-on.jpg',
      native: false,
    },
    ceilingLampOff: {
      path: 'projects/the-backrooms/textures',
      src: 'backrooms-[metal]-light-off.jpg',
      native: false,
    },
    moldEdge: {
      path: 'projects/the-backrooms/textures',
      src: 'mold-edge.jpg',
      native: false,
      flags: POLY_QUAD | POLY_TRANS | POLY_NO_SHADOW,
    },
    socket: {
      clean: {
        path: 'projects/the-backrooms/textures',
        src: 'socket-clean.bmp',
        native: false,
        flags: POLY_QUAD | POLY_NO_SHADOW,
      },
      broken: {
        path: 'projects/the-backrooms/textures',
        src: 'socket-broken.bmp',
        native: false,
        flags: POLY_QUAD | POLY_NO_SHADOW,
      },
      old: {
        path: 'projects/the-backrooms/textures',
        src: 'socket-old.bmp',
        native: false,
        flags: POLY_QUAD | POLY_NO_SHADOW,
      },
    },
    rails: {
      path: 'projects/the-backrooms/textures',
      src: 'rails.bmp',
      native: false,
      flags: POLY_QUAD | POLY_NO_SHADOW,
    },
  },
  water: {
    cave: {
      src: '(WATER)CAVEWATER.jpg',
      native: true,
      flags: POLY_QUAD | POLY_NO_SHADOW | POLY_WATER | POLY_TRANS,
    },
  },
  forest: {
    forest: [
      // source: https://www.textures.com/system/gallery/photos/Landscapes/Green/107589/LandscapesGreen0094_1_600.jpg?v=5
      {
        path: 'projects/forest/textures',
        src: 'forest.bmp',
        native: false,
        flags: POLY_QUAD | POLY_NO_SHADOW,
      },
      {
        path: 'projects/forest/textures',
        src: 'forest2.bmp',
        native: false,
        flags: POLY_QUAD | POLY_NO_SHADOW,
      },
      {
        path: 'projects/forest/textures',
        src: 'forest3.bmp',
        native: false,
        flags: POLY_QUAD | POLY_NO_SHADOW,
      },
    ],
  },
}

let usedTextures: Texture[] = []

export const useTexture = (texture: TextureDefinition | null) => {
  if (texture === textures.none) {
    return 0
  }

  if (!usedTextures.includes(texture)) {
    usedTextures.push(texture)
  }

  return usedTextures.indexOf(texture) + 1
}

export const createTextureContainers = (mapData: any) => {
  mapData.fts.textureContainers = usedTextures.map((texture, idx) => {
    return {
      tc: idx + 1,
      temp: 0,
      fic: `GRAPH\\OBJ3D\\TEXTURES\\${texture.src}`,
    }
  })
}

export const exportTextures = (outputDir: string) => {
  const copyOfUsedTextures = clone(usedTextures)
  const customTextures = copyOfUsedTextures.filter(({ native }) => native === false)
  const texturesToBeExported = uniq(customTextures)

  return texturesToBeExported.reduce((files, texture) => {
    const filename = `${outputDir}/graph/obj3d/textures/${texture.src}`
    files[filename] = `${getRootPath()}/assets/${texture.path ?? 'graph/obj3d/textures'}/${texture.src}`

    return files
  }, {} as Record<string, string>)
}

export const resetTextures = () => {
  usedTextures = []
}
