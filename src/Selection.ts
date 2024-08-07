import { Box3 } from 'three'
import { Entities } from '@src/Entities.js'
import { Fogs } from '@src/Fogs.js'
import { Lights } from '@src/Lights.js'
import { Paths } from '@src/Paths.js'
import { Polygons } from '@src/Polygons.js'
import { Texture } from '@src/Texture.js'
import { Vector3 } from '@src/Vector3.js'
import { Zones } from '@src/Zones.js'
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
   * @returns a copy of the elements that have been deleted
   */
  delete() {
    const copiedItems = this.copy().get()

    if (copiedItems.length > 0) {
      groupSequences(this.selection)
        .reverse()
        .forEach(([start, size]) => {
          this.items.splice(start, size)
        })

      this.selection = []
    }

    return copiedItems
  }

  apply(fn: (item: T[0], idx: number) => void) {
    this.selection.forEach((idx) => {
      const item = this.items[idx]
      fn(item, idx)
    })

    return this
  }

  move(offset: Vector3) {
    return this.apply((item) => {
      item.move(offset)
    })
  }

  abstract copy(): this
}

// ----------------------------------------

export class PolygonSelection extends Selection<Polygons> {
  copy() {
    const copiedItems = this.selection.map((idx) => this.items[idx].clone())
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
    const copiedItems = this.selection.map((idx) => this.items[idx].clone())
    return new LightsSelection(new Lights(...copiedItems)) as this
  }
}

export class EntitiesSelection extends Selection<Entities> {
  copy() {
    const copiedItems = this.selection.map((idx) => this.items[idx].clone())
    return new EntitiesSelection(new Entities(...copiedItems)) as this
  }
}

export class FogsSelection extends Selection<Fogs> {
  copy() {
    const copiedItems = this.selection.map((idx) => this.items[idx].clone())
    return new FogsSelection(new Fogs(...copiedItems)) as this
  }
}

export class PathsSelection extends Selection<Paths> {
  copy() {
    const copiedItems = this.selection.map((idx) => this.items[idx].clone())
    return new PathsSelection(new Paths(...copiedItems)) as this
  }
}

export class ZonesSelection extends Selection<Zones> {
  copy() {
    const copiedItems = this.selection.map((idx) => this.items[idx].clone())
    return new ZonesSelection(new Zones(...copiedItems)) as this
  }
}

// ----------------------------------------

type ArrayLikeArxTypes = Polygons | Lights | Entities | Fogs | Paths | Zones

const instances = new WeakMap<ArrayLikeArxTypes, Selection<ArrayLikeArxTypes>>()

type OverloadsOf$ = {
  <U extends Array<any>, T extends Selection<U>>(items: T): T
  (items: Polygons): PolygonSelection
  (items: Entities): EntitiesSelection
  (items: Lights): LightsSelection
  (items: Fogs): FogsSelection
  (items: Paths): PathsSelection
  (items: Zones): ZonesSelection
}

/**
 * Calling methods on the selected items will mutate the original values
 * unless you create a copy of them with the `.copy()` method
 * the copied (or original if no copy has been called) values can
 * be read with the `.get()` method.
 */
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
    } else if (items instanceof Fogs) {
      instance = new FogsSelection(items)
    } else if (items instanceof Paths) {
      instance = new PathsSelection(items)
    } else {
      instance = new ZonesSelection(items)
    }

    instances.set(items, instance)
  }

  return instance
}
