import type { Settings } from '@platform/common/Settings.js'
import type { FileExports } from '@src/types.js'

export enum UiElements {
  MainMenuBackground = 'main-menu-background',
}

export class UI {
  customElements: Record<UiElements, string | undefined> = {
    [UiElements.MainMenuBackground]: undefined,
  }

  /**
   * filename should point to a file relative to `settings.assetsDir`
   */
  set(element: UiElements, filename: string): void {
    this.customElements[element] = filename
  }

  reset(element: UiElements): void {
    this.customElements[element] = undefined
  }

  get(element: UiElements): string | undefined {
    return this.customElements[element]
  }

  exportSourcesAndTargets(settings: Settings): FileExports {
    const files: FileExports = {}

    if (this.customElements[UiElements.MainMenuBackground] !== undefined) {
      const source = this.customElements[UiElements.MainMenuBackground]
      files['graph/interface/menus/menu_main_background.jpg'] = source
    }

    return files
  }
}
