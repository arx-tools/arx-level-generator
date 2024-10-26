import path from 'node:path'
import { type Settings } from '@src/Settings.js'

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

  exportSourcesAndTargets(settings: Settings): Record<string, string> {
    const files: Record<string, string> = {}

    if (this.elementVisibility[HudElements.Minimap] === false) {
      const source = path.resolve(settings.internalAssetsDir, 'reset/blank-360x532.bmp')
      const target = path.resolve(settings.outputDir, `graph/levels/level${settings.levelIdx}/map.bmp`)
      files[target] = source
    }

    if (this.elementVisibility[HudElements.Healthbar] === false) {
      const source1 = path.resolve(settings.internalAssetsDir, 'reset/blank-330x800.bmp')
      const target1 = path.resolve(settings.outputDir, 'graph/interface/bars/empty_gauge_red.bmp')
      files[target1] = source1

      const source2 = path.resolve(settings.internalAssetsDir, 'reset/blank-330x800.bmp')
      const target2 = path.resolve(settings.outputDir, 'graph/interface/bars/filled_gauge_red.bmp')
      files[target2] = source2
    }

    if (this.elementVisibility[HudElements.Manabar] === false) {
      const source1 = path.resolve(settings.internalAssetsDir, 'reset/blank-330x800.bmp')
      const target1 = path.resolve(settings.outputDir, 'graph/interface/bars/empty_gauge_blue.bmp')
      files[target1] = source1

      const source2 = path.resolve(settings.internalAssetsDir, 'reset/blank-330x800.bmp')
      const target2 = path.resolve(settings.outputDir, 'graph/interface/bars/filled_gauge_blue.bmp')
      files[target2] = source2
    }

    if (this.elementVisibility[HudElements.StealthIndicator] === false) {
      const source = path.resolve(settings.internalAssetsDir, 'reset/blank-32x32.bmp')
      const target = path.resolve(settings.outputDir, 'graph/interface/icons/stealth_gauge.bmp')
      files[target] = source
    }

    if (this.elementVisibility[HudElements.StealingIcon] === false) {
      const source = path.resolve(settings.internalAssetsDir, 'reset/blank-128x128.bmp')
      const target = path.resolve(settings.outputDir, 'graph/interface/icons/steal.bmp')
      files[target] = source
    }

    if (this.elementVisibility[HudElements.LevelUpIcon] === false) {
      const source = path.resolve(settings.internalAssetsDir, 'reset/blank-32x32.bmp')
      const target = path.resolve(settings.outputDir, 'graph/interface/icons/lvl_up.bmp')
      files[target] = source
    }

    if (this.elementVisibility[HudElements.BookIcon] === false) {
      const source = path.resolve(settings.internalAssetsDir, 'reset/blank-32x32.bmp')
      const target = path.resolve(settings.outputDir, 'graph/interface/icons/book.bmp')
      files[target] = source
    }

    if (this.elementVisibility[HudElements.BackpackIcon] === false) {
      const source = path.resolve(settings.internalAssetsDir, 'reset/blank-32x32.bmp')
      const target = path.resolve(settings.outputDir, 'graph/interface/icons/backpack.bmp')
      files[target] = source
    }

    if (this.elementVisibility[HudElements.PurseIcon] === false) {
      const source = path.resolve(settings.internalAssetsDir, 'reset/blank-32x32.bmp')
      const target = path.resolve(settings.outputDir, 'graph/interface/inventory/gold.bmp')
      files[target] = source
    }

    if (this.elementVisibility[HudElements.HerosayIcon] === false) {
      const source = path.resolve(settings.internalAssetsDir, 'reset/blank-32x32.bmp')
      const target = path.resolve(settings.outputDir, 'graph/interface/icons/arx_logo_32.bmp')
      files[target] = source
    }

    return files
  }
}
