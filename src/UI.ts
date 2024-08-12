import path from 'node:path'
import { type Settings } from '@src/Settings.js'

export enum UiElements {
  MainMenuBackground = 'main-menu-background',
}

export class UI {
  customElements: Record<UiElements, string | undefined> = {
    [UiElements.MainMenuBackground]: undefined,
  }

  set(element: UiElements, filename: string): void {
    this.customElements[element] = filename
  }

  reset(element: UiElements): void {
    this.customElements[element] = undefined
  }

  get(element: UiElements): string | undefined {
    return this.customElements[element]
  }

  exportSourcesAndTargets(settings: Settings): Record<string, string> {
    const files: Record<string, string> = {}

    if (this.customElements[UiElements.MainMenuBackground] !== undefined) {
      const source = path.resolve(settings.assetsDir, this.customElements[UiElements.MainMenuBackground])
      const target = path.resolve(settings.outputDir, 'graph/interface/menus/menu_main_background.jpg')
      files[target] = source
    }

    return files
  }
}
