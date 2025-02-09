import { type Settings } from '@platform/common/Settings.js'
import { generateBlankBMP } from '@src/helpers.js'

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

  exportSourcesAndTargets(settings: Settings): Record<string, ArrayBuffer> {
    const files: Record<string, ArrayBuffer> = {}

    if (this.elementVisibility[HudElements.Minimap] === false) {
      files[`graph/levels/level${settings.levelIdx}/map.bmp`] = blank360x532
    }

    if (this.elementVisibility[HudElements.Healthbar] === false) {
      files['graph/interface/bars/empty_gauge_red.bmp'] = blank330x800
      files['graph/interface/bars/filled_gauge_red.bmp'] = blank330x800
    }

    if (this.elementVisibility[HudElements.Manabar] === false) {
      files['graph/interface/bars/empty_gauge_blue.bmp'] = blank330x800
      files['graph/interface/bars/filled_gauge_blue.bmp'] = blank330x800
    }

    if (this.elementVisibility[HudElements.StealthIndicator] === false) {
      files['graph/interface/icons/stealth_gauge.bmp'] = blank32x32
    }

    if (this.elementVisibility[HudElements.StealingIcon] === false) {
      files['graph/interface/icons/steal.bmp'] = blank128x128
    }

    if (this.elementVisibility[HudElements.LevelUpIcon] === false) {
      files['graph/interface/icons/lvl_up.bmp'] = blank32x32
    }

    if (this.elementVisibility[HudElements.BookIcon] === false) {
      files['graph/interface/icons/book.bmp'] = blank32x32
    }

    if (this.elementVisibility[HudElements.BackpackIcon] === false) {
      files['graph/interface/icons/backpack.bmp'] = blank32x32
    }

    if (this.elementVisibility[HudElements.PurseIcon] === false) {
      files['graph/interface/inventory/gold.bmp'] = blank32x32
    }

    if (this.elementVisibility[HudElements.HerosayIcon] === false) {
      files['graph/interface/icons/arx_logo_32.bmp'] = blank32x32
    }

    return files
  }
}
