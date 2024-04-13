import { Box3 } from 'three'
import { Polygon } from '@src/Polygon.js'
import { Polygons } from '@src/Polygons.js'
import { Texture } from '@src/Texture.js'
import { groupSequences } from '@src/faux-ramda.js'
import { Vector3 } from './Vector3.js'

export abstract class Selection {
  protected selection: number[] = []

  // TODO: make this non-dependant of the Polygon/Polygons classes
  protected items: Polygons

  // TODO: make this non-dependant of the Polygon/Polygons classes
  constructor(polygons: Polygons) {
    this.items = polygons
  }

  deselect() {
    this.selection = []
    return this
  }

  get length() {
    return this.selection.length
  }

  isEmpty() {
    return this.length === 0
  }

  selectAll() {
    this.selection = Array.from(this.items.keys())
    return this
  }

  // TODO: make this non-dependant of the Polygon/Polygons classes
  /**
   * selects items based on a given predicate
   * if there are already items selected then this filters those further
   */
  selectBy(predicate: (polygon: Polygon, idx: number) => boolean) {
    if (this.isEmpty()) {
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
    if (this.selection.length === 0) {
      return this.selectAll()
    }

    // all selected -> none selected
    if (this.selection.length === this.items.length) {
      return this.deselect()
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
    const selectedAmount = this.selection.length

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

  // TODO: make this non-dependant of the Polygon/Polygons classes
  apply(fn: (polygon: Polygon, idx: number) => void) {
    const applyToAll = this.isEmpty()

    if (applyToAll) {
      this.selectAll()
    }

    this.selection.forEach((idx) => {
      const polygon = this.items[idx]
      fn(polygon, idx)
    })

    if (applyToAll) {
      this.deselect()
    }

    return this
  }

  abstract copy(): this
}

export class PolygonSelection extends Selection {
  copy() {
    const applyToAll = this.isEmpty()

    if (applyToAll) {
      this.selectAll()
    }

    const copiedItems = this.selection.map((idx) => this.items[idx].clone())

    if (applyToAll) {
      this.deselect()
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

const instances = new WeakMap<Polygons, Selection>()

export const $ = (items: Selection | Polygons) => {
  if (items instanceof Selection) {
    return items
  }

  let instance = instances.get(items)
  if (instance === undefined) {
    instance = new PolygonSelection(items)
    instances.set(items, instance)
  }

  return instance
}
