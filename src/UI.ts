import path from 'node:path'

export enum UiElements {
  MainMenuBackground = 'main-menu-background',
}

export class UI {
  customElements: Record<UiElements, string | undefined> = {
    [UiElements.MainMenuBackground]: undefined,
  }

  set(element: UiElements, filename: string) {
    this.customElements[element] = filename
  }

  reset(element: UiElements) {
    this.customElements[element] = undefined
  }

  get(element: UiElements) {
    return this.customElements[element]
  }

  async exportSourcesAndTargets(outputDir: string) {
    const files: Record<string, string> = {}

    if (this.customElements[UiElements.MainMenuBackground] !== undefined) {
      const source = path.resolve('assets', this.customElements[UiElements.MainMenuBackground])
      const target = path.resolve(outputDir, 'graph/interface/menus/menu_main_background.jpg')
      files[target] = source
    }

    return files
  }
}
