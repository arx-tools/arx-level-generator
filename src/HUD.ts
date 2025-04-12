import path from 'node:path'
import { type Settings } from '@src/Settings.js'
import { generateBlankBMP } from '@src/helpers.js'
import { type ArrayBufferExports } from '@src/types.js'

export enum HudElements {
  Minimap = 'minimap',
  Healthbar = 'healthbar',
  Manabar = 'manabar',
  StealthIndicator = 'stealth-indicator',
  StealingIcon = 'stealing-icon',
  LevelUpIcon = 'level-up-icon',
  BookIcon = 'book-icon',
  BackpackIcon = 'backpack-icon',
  PurseIcon = 'purse-icon',
  HerosayIcon = 'herosay-icon',
}

const blank360x532 = generateBlankBMP(360, 532)
const blank330x800 = generateBlankBMP(330, 800)
const blank128x128 = generateBlankBMP(128, 128)
const blank32x32 = generateBlankBMP(32, 32)

export class HUD {
  elementVisibility: Record<HudElements, boolean>

  constructor() {
    this.elementVisibility = {
      [HudElements.Minimap]: true,
      [HudElements.Healthbar]: true,
      [HudElements.Manabar]: true,
      [HudElements.StealthIndicator]: true,
      [HudElements.StealingIcon]: true,
      [HudElements.LevelUpIcon]: true,
      [HudElements.BookIcon]: true,
      [HudElements.BackpackIcon]: true,
      [HudElements.PurseIcon]: true,
      [HudElements.HerosayIcon]: true,
    }
  }

  hide(hudElement: HudElements | 'all'): void {
    if (hudElement === 'all') {
      for (const key in this.elementVisibility) {
        this.elementVisibility[key as HudElements] = false
      }
    } else {
      this.elementVisibility[hudElement] = false
    }
  }

  show(hudElement: HudElements | 'all'): void {
    if (hudElement === 'all') {
      for (const key in this.elementVisibility) {
        this.elementVisibility[key as HudElements] = true
      }
    } else {
      this.elementVisibility[hudElement] = true
    }
  }

  exportSourcesAndTargets(settings: Settings): ArrayBufferExports {
    const files: ArrayBufferExports = {}

    if (this.elementVisibility[HudElements.Minimap] === false) {
      const target = path.resolve(settings.outputDir, `graph/levels/level${settings.levelIdx}/map.bmp`)
      files[target] = blank360x532
    }

    if (this.elementVisibility[HudElements.Healthbar] === false) {
      const target1 = path.resolve(settings.outputDir, 'graph/interface/bars/empty_gauge_red.bmp')
      files[target1] = blank330x800

      const target2 = path.resolve(settings.outputDir, 'graph/interface/bars/filled_gauge_red.bmp')
      files[target2] = blank330x800
    }

    if (this.elementVisibility[HudElements.Manabar] === false) {
      const target1 = path.resolve(settings.outputDir, 'graph/interface/bars/empty_gauge_blue.bmp')
      files[target1] = blank330x800

      const target2 = path.resolve(settings.outputDir, 'graph/interface/bars/filled_gauge_blue.bmp')
      files[target2] = blank330x800
    }

    if (this.elementVisibility[HudElements.StealthIndicator] === false) {
      const target = path.resolve(settings.outputDir, 'graph/interface/icons/stealth_gauge.bmp')
      files[target] = blank32x32
    }

    if (this.elementVisibility[HudElements.StealingIcon] === false) {
      const target = path.resolve(settings.outputDir, 'graph/interface/icons/steal.bmp')
      files[target] = blank128x128
    }

    if (this.elementVisibility[HudElements.LevelUpIcon] === false) {
      const target = path.resolve(settings.outputDir, 'graph/interface/icons/lvl_up.bmp')
      files[target] = blank32x32
    }

    if (this.elementVisibility[HudElements.BookIcon] === false) {
      const target = path.resolve(settings.outputDir, 'graph/interface/icons/book.bmp')
      files[target] = blank32x32
    }

    if (this.elementVisibility[HudElements.BackpackIcon] === false) {
      const target = path.resolve(settings.outputDir, 'graph/interface/icons/backpack.bmp')
      files[target] = blank32x32
    }

    if (this.elementVisibility[HudElements.PurseIcon] === false) {
      const target = path.resolve(settings.outputDir, 'graph/interface/inventory/gold.bmp')
      files[target] = blank32x32
    }

    if (this.elementVisibility[HudElements.HerosayIcon] === false) {
      const target = path.resolve(settings.outputDir, 'graph/interface/icons/arx_logo_32.bmp')
      files[target] = blank32x32
    }

    return files
  }
}
