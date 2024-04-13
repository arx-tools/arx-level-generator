import { Box3 } from 'three'
import { Entities } from '@src/Entities.js'
import { Fog } from '@src/Fog.js'
import { Lights } from '@src/Lights.js'
import { Path } from '@src/Path.js'
import { Polygons } from '@src/Polygons.js'
import { Texture } from '@src/Texture.js'
import { Vector3 } from '@src/Vector3.js'
import { Zone } from '@src/Zone.js'
import { groupSequences } from '@src/faux-ramda.js'

export abstract class Selection<T extends Array<any>> {
  protected selection: number[] = []
  protected items: T

  constructor(items: T) {
    this.items = items
  }

  get() {
    return this.items
  }

  clearSelection() {
    this.selection = []
    return this
  }

  hasSelection() {
    return this.selection.length > 0
  }

  sizeOfSelection() {
    return this.selection.length
  }

  selectAll() {
    this.selection = Array.from(this.items.keys())
    return this
  }

  /**
   * selects items based on a given predicate
   * if there are already items selected then this filters those further
   */
  selectBy(predicate: (item: T[0], idx: number) => boolean) {
    if (!this.hasSelection()) {
      this.selectAll()
    }

    this.selection = this.selection.filter((idx) => {
      const item = this.items[idx]
      return predicate(item, idx)
    })

    return this
  }

  invertSelection() {
    // none selected -> all selected
    if (!this.hasSelection()) {
      return this.selectAll()
    }

    // all selected -> none selected
    if (this.sizeOfSelection() === this.items.length) {
      return this.clearSelection()
    }

    const selection = this.selection.toSorted((a, b) => a - b)

    this.selection = []

    let idx = 0
    let current = selection[idx]

    for (let candidate = 0; candidate < this.items.length; candidate++) {
      if (candidate === current) {
        if (idx < selection.length) {
          idx += 1
          current = selection[idx]
        }
      } else {
        this.selection.push(candidate)
      }
    }

    return this
  }

  /**
   * Removes items which have been selected
   *
   * @returns the number of items that have ben removed
   */
  delete() {
    const selectedAmount = this.sizeOfSelection()

    if (selectedAmount > 0) {
      groupSequences(this.selection)
        .reverse()
        .forEach(([start, size]) => {
          this.items.splice(start, size)
        })

      this.selection = []
    }

    return selectedAmount
  }

  apply(fn: (item: T[0], idx: number) => void) {
    const applyToAll = !this.hasSelection()

    if (applyToAll) {
      this.selectAll()
    }

    this.selection.forEach((idx) => {
      const item = this.items[idx]
      fn(item, idx)
    })

    if (applyToAll) {
      this.clearSelection()
    }

    return this
  }

  abstract copy(): this
}

// ----------------------------------------

export class PolygonSelection extends Selection<Polygons> {
  copy() {
    const applyToAll = !this.hasSelection()

    if (applyToAll) {
      this.selectAll()
    }

    const copiedItems = this.selection.map((idx) => this.items[idx].clone())

    if (applyToAll) {
      this.clearSelection()
    }

    return new PolygonSelection(new Polygons(...copiedItems)) as this
  }

  /**
   * selects polygons which go outside the 0-160 meters boundary on the horizontal axis
   */
  selectOutOfBounds() {
    return this.selectBy((polygon) => polygon.isOutOfBounds())
  }

  selectWithinBox(box: Box3) {
    return this.selectBy((polygon) => polygon.isWithin(box))
  }

  selectByTextures(textures: (Texture | string)[]) {
    return this.selectBy((polygon) => polygon.texture?.equalsAny(textures) ?? false)
  }

  makeDoubleSided() {
    return this.apply((polygon) => {
      polygon.makeDoubleSided()
    })
  }

  moveToRoom1() {
    return this.apply((polygon) => {
      if (polygon.room < 1) {
        return
      }

      polygon.room = 1
    })
  }

  move(offset: Vector3) {
    return this.apply((polygon) => {
      polygon.move(offset)
    })
  }

  scale(scale: number) {
    return this.apply((polygon) => {
      polygon.scale(scale)
    })
  }

  flipUVHorizontally() {
    return this.apply((polygon) => {
      polygon.flipUVHorizontally()
    })
  }

  flipUVVertically() {
    return this.apply((polygon) => {
      polygon.flipUVVertically()
    })
  }
}

export class LightsSelection extends Selection<Lights> {
  copy() {
    const applyToAll = !this.hasSelection()

    if (applyToAll) {
      this.selectAll()
    }

    const copiedItems = this.selection.map((idx) => this.items[idx].clone())

    if (applyToAll) {
      this.clearSelection()
    }

    return new LightsSelection(new Lights(...copiedItems)) as this
  }

  move(offset: Vector3) {
    return this.apply((light) => {
      light.position.add(offset)
    })
  }
}

export class EntitiesSelection extends Selection<Entities> {
  copy() {
    const applyToAll = !this.hasSelection()

    if (applyToAll) {
      this.selectAll()
    }

    const copiedItems = this.selection.map((idx) => this.items[idx].clone())

    if (applyToAll) {
      this.clearSelection()
    }

    return new EntitiesSelection(new Entities(...copiedItems)) as this
  }

  move(offset: Vector3) {
    return this.apply((entity) => {
      entity.move(offset)
    })
  }
}

export class FogsSelection extends Selection<Fog[]> {
  copy() {
    const applyToAll = !this.hasSelection()

    if (applyToAll) {
      this.selectAll()
    }

    const copiedItems = this.selection.map((idx) => this.items[idx].clone())

    if (applyToAll) {
      this.clearSelection()
    }

    return new FogsSelection(copiedItems) as this
  }

  move(offset: Vector3) {
    return this.apply((fog) => {
      fog.move(offset)
    })
  }
}

export class PathsSelection extends Selection<Path[]> {
  copy() {
    const applyToAll = !this.hasSelection()

    if (applyToAll) {
      this.selectAll()
    }

    const copiedItems = this.selection.map((idx) => this.items[idx].clone())

    if (applyToAll) {
      this.clearSelection()
    }

    return new PathsSelection(copiedItems) as this
  }

  move(offset: Vector3) {
    return this.apply((path) => {
      path.move(offset)
    })
  }
}

export class ZonesSelection extends Selection<Zone[]> {
  copy() {
    const applyToAll = !this.hasSelection()

    if (applyToAll) {
      this.selectAll()
    }

    const copiedItems = this.selection.map((idx) => this.items[idx].clone())

    if (applyToAll) {
      this.clearSelection()
    }

    return new ZonesSelection(copiedItems) as this
  }

  move(offset: Vector3) {
    return this.apply((zone) => {
      zone.move(offset)
    })
  }
}

// ----------------------------------------

type ArrayLikeArxTypes = Polygons | Lights | Entities | Fog[] | Path[] | Zone[]

const instances = new WeakMap<ArrayLikeArxTypes, Selection<ArrayLikeArxTypes>>()

type OverloadsOf$ = {
  <U extends Array<any>, T extends Selection<U>>(items: T): T
  (items: Polygons): PolygonSelection
  (items: Entities): EntitiesSelection
  (items: Lights): LightsSelection
  (items: Fog[]): FogsSelection
  (items: Path[]): PathsSelection
  (items: Zone[]): ZonesSelection
}

export const $: OverloadsOf$ = <U extends Array<any>, T extends Selection<U>>(items: T | ArrayLikeArxTypes) => {
  if (items instanceof Selection) {
    return items
  }

  let instance = instances.get(items)
  if (instance === undefined) {
    if (items instanceof Polygons) {
      instance = new PolygonSelection(items)
    } else if (items instanceof Entities) {
      instance = new EntitiesSelection(items)
    } else if (items instanceof Lights) {
      instance = new LightsSelection(items)
    } else {
      if (items.length > 0) {
        const item = items[0]
        if (item instanceof Fog) {
          instance = new FogsSelection(items as Fog[])
        } else if (item instanceof Zone) {
          instance = new PathsSelection(items as Path[])
        } else {
          instance = new ZonesSelection(items as Zone[])
        }
      } else {
        throw new Error(
          `Selection: can't determine type of array that was given to $(), try passing in a non-empty array`,
        )
      }
    }

    instances.set(items, instance)
  }

  return instance
}
