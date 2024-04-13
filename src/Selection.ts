import { Box3 } from 'three'
import { Polygon } from '@src/Polygon.js'
import { Polygons } from '@src/Polygons.js'
import { Texture } from '@src/Texture.js'
import { groupSequences } from '@src/faux-ramda.js'
import { Vector3 } from './Vector3.js'

export class Selection {
  private selection: number[] = []
  private items: Polygons

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

  /**
   * selects polygons based on a given predicate
   * if there are already polygons selected then this filters those further
   */
  selectBy(predicate: (polygon: Polygon, idx: number) => boolean) {
    if (this.isEmpty()) {
      this.selectAll()
    }

    this.selection = this.selection.filter((idx) => {
      const polygon = this.items[idx]
      return predicate(polygon, idx)
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
   * Removes polygons which have been selected
   *
   * @returns the number of polygons that have ben removed
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

  copy() {
    const applyToAll = this.isEmpty()

    if (applyToAll) {
      this.selectAll()
    }

    const copiedPolygons = this.selection.map((idx) => this.items[idx].clone())

    if (applyToAll) {
      this.deselect()
    }

    return new Selection(new Polygons(...copiedPolygons))
  }

  // ------------------------------------
  // TODO: the following functions are Polygons / Array<Polygon> specific
  // but it could be extended to work with other Array<> classes of the level generator

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

// ------------------

const instances = new WeakMap<Polygons, Selection>()

export const $ = (polygons: Selection | Polygons) => {
  if (polygons instanceof Selection) {
    return polygons
  }

  const instance = instances.get(polygons)
  if (instance !== undefined) {
    return instance
  }

  const query = new Selection(polygons)
  instances.set(polygons, query)

  return query
}
