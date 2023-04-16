import path from 'node:path'

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
}

export class HUD {
  elements: Record<HudElements, boolean> = {
    [HudElements.Minimap]: true,
    [HudElements.Healthbar]: true,
    [HudElements.Manabar]: true,
    [HudElements.StealthIndicator]: true,
    [HudElements.StealingIcon]: true,
    [HudElements.LevelUpIcon]: true,
    [HudElements.BookIcon]: true,
    [HudElements.BackpackIcon]: true,
    [HudElements.PurseIcon]: true,
  }

  hide(hudElement: HudElements | 'all') {
    if (hudElement === 'all') {
      for (let key in this.elements) {
        this.elements[key as HudElements] = false
      }
    } else {
      this.elements[hudElement] = false
    }
  }

  show(hudElement: HudElements | 'all') {
    if (hudElement === 'all') {
      for (let key in this.elements) {
        this.elements[key as HudElements] = true
      }
    } else {
      this.elements[hudElement] = true
    }
  }

  exportSourcesAndTargets(outputDir: string, levelIdx: number) {
    const files: Record<string, string> = {}

    if (this.elements[HudElements.Minimap] === false) {
      const source = path.resolve('assets', 'reset/blank-360x532.bmp')
      const target = path.resolve(outputDir, `graph/levels/level${levelIdx}/map.bmp`)
      files[target] = source
    }

    if (this.elements[HudElements.Healthbar] === false) {
      const source1 = path.resolve('assets', 'reset/blank-330x800.bmp')
      const target1 = path.resolve(outputDir, 'graph/interface/bars/empty_gauge_red.bmp')
      files[target1] = source1

      const source2 = path.resolve('assets', 'reset/blank-330x800.bmp')
      const target2 = path.resolve(outputDir, 'graph/interface/bars/filled_gauge_red.bmp')
      files[target2] = source2
    }

    if (this.elements[HudElements.Manabar] === false) {
      const source1 = path.resolve('assets', 'reset/blank-330x800.bmp')
      const target1 = path.resolve(outputDir, 'graph/interface/bars/empty_gauge_blue.bmp')
      files[target1] = source1

      const source2 = path.resolve('assets', 'reset/blank-330x800.bmp')
      const target2 = path.resolve(outputDir, 'graph/interface/bars/filled_gauge_blue.bmp')
      files[target2] = source2
    }

    if (this.elements[HudElements.StealthIndicator] === false) {
      const source = path.resolve('assets', 'reset/blank-32x32.bmp')
      const target = path.resolve(outputDir, 'graph/interface/icons/stealth_gauge.bmp')
      files[target] = source
    }

    if (this.elements[HudElements.StealingIcon] === false) {
      const source = path.resolve('assets', 'reset/blank-128x128.bmp')
      const target = path.resolve(outputDir, 'graph/interface/icons/steal.bmp')
      files[target] = source
    }

    if (this.elements[HudElements.LevelUpIcon] === false) {
      const source = path.resolve('assets', 'reset/blank-32x32.bmp')
      const target = path.resolve(outputDir, 'graph/interface/icons/lvl_up.bmp')
      files[target] = source
    }

    if (this.elements[HudElements.BookIcon] === false) {
      const source = path.resolve('assets', 'reset/blank-32x32.bmp')
      const target = path.resolve(outputDir, 'graph/interface/icons/book.bmp')
      files[target] = source
    }

    if (this.elements[HudElements.BackpackIcon] === false) {
      const source = path.resolve('assets', 'reset/blank-32x32.bmp')
      const target = path.resolve(outputDir, 'graph/interface/icons/backpack.bmp')
      files[target] = source
    }

    if (this.elements[HudElements.PurseIcon] === false) {
      const source = path.resolve('assets', 'reset/blank-32x32.bmp')
      const target = path.resolve(outputDir, 'graph/interface/inventory/gold.bmp')
      files[target] = source
    }

    return files
  }
}
