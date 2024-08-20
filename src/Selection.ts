import { type Box3 } from 'three'
import { Entities } from '@src/Entities.js'
import { Fogs } from '@src/Fogs.js'
import { Lights } from '@src/Lights.js'
import { Paths } from '@src/Paths.js'
import { Polygons } from '@src/Polygons.js'
import { type Texture } from '@src/Texture.js'
import { type Vector3 } from '@src/Vector3.js'
import { Zones } from '@src/Zones.js'
import { groupSequences } from '@src/faux-ramda.js'
import { type ArxComponent } from './ArxComponent.js'

export abstract class Selection<T extends ArxComponent[]> {
  protected selection: number[] = []
  protected items: T

  constructor(items: T) {
    this.items = items
  }

  /**
   * Returns all the items regardless of any selection.
   *
   * To get the items of the selection call `.copy()` before calling `.get()`
   *
   * ```ts
   * const polygons = new Polygons()
   * const selectedPolygons = $(polygons).selectBy(<some predicate>).copy().get()
   * ```
   */
  get(): T {
    return this.items
  }

  /**
   * Empties the selection, so that afterwards nothing is selected.
   */
  clearSelection(): this {
    this.selection = []
    return this
  }

  /**
   * returns whether there are items selected or is the selection empty
   */
  hasSelection(): boolean {
    return this.selection.length > 0
  }

  /**
   * returns the number of selected items
   */
  sizeOfSelection(): number {
    return this.selection.length
  }

  /**
   * selects all items
   */
  selectAll(): this {
    this.selection = [...this.items.keys()]
    return this
  }

  /**
   * Selects items based on a given predicate (original position of items are not preserved, only their relative order
   * to each other).
   *
   * Example: select every 5th item:
   *
   * ```ts
   * $(items).selectBy((item, idx) => idx % 5 === 0)
   * // new selection = [0th item, 5th item, 10th item, ...]
   * ```
   *
   * ---
   *
   * If there are already items selected then this filters those further
   *
   * Example: selecting every 3rd item, then every 5th of those items
   *
   * ```ts
   * $(items)
   *  .selectBy((item, idx) => idx % 3 === 0)
   *  .selectBy((item, idx) => idx % 5 === 0)
   * ```
   *
   */
  selectBy(predicate: (item: T[0], idx: number) => boolean): this {
    if (!this.hasSelection()) {
      this.selectAll()
    }

    this.selection = this.selection.filter((idx) => {
      const item = this.items[idx] as T[0]
      return predicate(item, idx)
    })

    return this
  }

  /**
   * Unselects current items and selects every other one.
   */
  invertSelection(): this {
    // none selected -> all selected
    if (!this.hasSelection()) {
      return this.selectAll()
    }

    // all selected -> none selected
    if (this.sizeOfSelection() === this.items.length) {
      return this.clearSelection()
    }

    // flip selection
    const selection = this.selection.toSorted((a, b) => {
      return a - b
    })

    this.selection = []

    let idx = 0
    let current = selection[idx]

    for (let candidate = 0; candidate < this.items.length; candidate++) {
      if (candidate === current) {
        if (idx < selection.length) {
          idx = idx + 1
          current = selection[idx]
        }
      } else {
        this.selection.push(candidate)
      }
    }

    return this
  }

  /**
   * Removes selected items.
   *
   * A call to a `select*` method is required beforehand.
   *
   * @returns a copy of the elements that have been deleted
   */
  delete(): T {
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

  /**
   * calls a predicate function on every selected item
   */
  apply(fn: (item: T[0], idx: number) => void): this {
    this.selection.forEach((idx) => {
      const item = this.items[idx] as T[0]
      fn(item, idx)
    })

    return this
  }

  /**
   * moves selected items by a given offset
   */
  move(offset: Vector3): this {
    return this.apply((item) => {
      item.move(offset)
    })
  }

  /**
   * Copies the selected items.
   *
   * A call to a `select*` method is required beforehand.
   *
   * The returned copy has nothing selected inside, subsequent calls need a call to a `select*` method.
   */
  abstract copy(): Selection<T>
}

// ----------------------------------------

export class PolygonSelection extends Selection<Polygons> {
  /**
   * Copies the selected polygons.
   *
   * A call to a `select*` method is required beforehand.
   *
   * The returned copy has nothing selected inside, subsequent calls need a call to a `select*` method.
   */
  copy(): PolygonSelection {
    const copiedItems = this.selection.map((idx) => {
      return this.items[idx].clone()
    })
    return new PolygonSelection(new Polygons(...copiedItems))
  }

  /**
   * Selects polygons which go outside the 0-16000 boundary on the horizontal axis (x and z).
   *
   * This method pre-selects all polygons if none have been selected before.
   */
  selectOutOfBounds(): this {
    return this.selectBy((polygon) => {
      return polygon.isOutOfBounds()
    })
  }

  /**
   * Selects polygons within a given box.
   *
   * Keep in mind that Y axis are inverted in arx, -200 is higher than 500!
   *
   * This method pre-selects all polygons if none have been selected before.
   */
  selectWithinBox(box: Box3): this {
    return this.selectBy((polygon) => {
      return polygon.isWithin(box)
    })
  }

  /**
   * Selects polygons that have a specific texture or matches any of the specified textures.
   *
   * Texture comparision is done by comparing filenames without extension case insensitively
   * (see `Texture.equals()` and `Texture.equalsAny()`)
   *
   * This method pre-selects all polygons if none have been selected before.
   */
  selectByTextures(textures: (Texture | string)[]): this {
    return this.selectBy((polygon) => {
      return polygon.texture?.equalsAny(textures) ?? false
    })
  }

  /**
   * Makes the selected polygons double sided.
   *
   * A call to a `select*` method is required beforehand.
   */
  makeDoubleSided(): this {
    return this.apply((polygon) => {
      polygon.makeDoubleSided()
    })
  }

  /**
   * Moves selected polygons to room 1 by setting the room property to 1
   *
   * A call to a `select*` method is required beforehand.
   */
  moveToRoom1(): this {
    return this.apply((polygon) => {
      if (polygon.room < 1) {
        return
      }

      polygon.room = 1
    })
  }

  /**
   * Scales selected polygons.
   *
   * Scaling is done from `0/0/0` world coordinates, so selected polygons need to be
   * centralized beforehand, otherwise the distance from `0/0/0` will also scale.
   *
   * A call to a `select*` method is required beforehand.
   */
  scale(scale: number): this {
    return this.apply((polygon) => {
      polygon.scale(scale)
    })
  }

  /**
   * Flips the UV horizontally to the selected polygons.
   *
   * A call to a `select*` method is required beforehand.
   */
  flipUVHorizontally(): this {
    return this.apply((polygon) => {
      polygon.flipUVHorizontally()
    })
  }

  /**
   * Flips the UV vertically to the selected polygons.
   *
   * A call to a `select*` method is required beforehand.
   */
  flipUVVertically(): this {
    return this.apply((polygon) => {
      polygon.flipUVVertically()
    })
  }
}

export class LightsSelection extends Selection<Lights> {
  /**
   * Copies the selected lights.
   *
   * A call to a `select*` method is required beforehand.
   *
   * The returned copy has nothing selected inside, subsequent calls need a call to a `select*` method.
   */
  copy(): LightsSelection {
    const copiedItems = this.selection.map((idx) => {
      return this.items[idx].clone()
    })
    return new LightsSelection(new Lights(...copiedItems))
  }
}

export class EntitiesSelection extends Selection<Entities> {
  /**
   * Copies the selected entities.
   *
   * A call to a `select*` method is required beforehand.
   *
   * The returned copy has nothing selected inside, subsequent calls need a call to a `select*` method.
   */
  copy(): EntitiesSelection {
    const copiedItems = this.selection.map((idx) => {
      return this.items[idx].clone()
    })
    return new EntitiesSelection(new Entities(...copiedItems))
  }
}

export class FogsSelection extends Selection<Fogs> {
  /**
   * Copies the selected fogs.
   *
   * A call to a `select*` method is required beforehand.
   *
   * The returned copy has nothing selected inside, subsequent calls need a call to a `select*` method.
   */
  copy(): FogsSelection {
    const copiedItems = this.selection.map((idx) => {
      return this.items[idx].clone()
    })
    return new FogsSelection(new Fogs(...copiedItems))
  }
}

export class PathsSelection extends Selection<Paths> {
  /**
   * Copies the selected paths.
   *
   * A call to a `select*` method is required beforehand.
   *
   * The returned copy has nothing selected inside, subsequent calls need a call to a `select*` method.
   */
  copy(): PathsSelection {
    const copiedItems = this.selection.map((idx) => {
      return this.items[idx].clone()
    })
    return new PathsSelection(new Paths(...copiedItems))
  }
}

export class ZonesSelection extends Selection<Zones> {
  /**
   * Copies the selected zones.
   *
   * A call to a `select*` method is required beforehand.
   *
   * The returned copy has nothing selected inside, subsequent calls need a call to a `select*` method.
   */
  copy(): ZonesSelection {
    const copiedItems = this.selection.map((idx) => {
      return this.items[idx].clone()
    })
    return new ZonesSelection(new Zones(...copiedItems))
  }
}

// ----------------------------------------

type ArrayLikeArxTypes = Polygons | Lights | Entities | Fogs | Paths | Zones

const instances = new WeakMap<ArrayLikeArxTypes, Selection<ArrayLikeArxTypes>>()

/**
 * Calling methods on the selected items will mutate the original values
 * unless you create a copy of them with the `.copy()` method
 * the copied (or original if no copy has been called) values can
 * be read with the `.get()` method.
 *
 * ```ts
 * const polygons = new Polygons()
 * // move every polygon down 100 units:
 * $(polygons).selectAll().move(new Vector(0, 100, 0))
 *
 * // create a copy of the polygons and move them: (note the .copy() before .move())
 * const tmp = $(polygons).selectAll().copy().move(new Vector(0, 100, 0))
 * // access the copied polygons from the Selection object
 * const copyOfPolygons = tmp.get()
 * ```
 *
 * ---
 *
 * Passing in a selection will return itself:
 *
 * ```ts
 * const polygons = new Polygons()
 * const selA = $(polygons) // typeof selA === PolygonSelection
 * const selB = $(selA) // selA === selB
 * ```
 */
export function $(items: Polygons | PolygonSelection): PolygonSelection
export function $(items: Entities | EntitiesSelection): EntitiesSelection
export function $(items: Lights | LightsSelection): LightsSelection
export function $(items: Fogs | FogsSelection): FogsSelection
export function $(items: Paths | PathsSelection): PathsSelection
export function $(items: Zones | ZonesSelection): ZonesSelection
export function $<U extends ArxComponent[], T extends Selection<U>>(
  items: T | ArrayLikeArxTypes,
): T | Selection<ArrayLikeArxTypes> {
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
