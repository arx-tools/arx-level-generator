import { Vector3 } from '@src/Vector3.js'

export type CursorSave = {
  oldSize: Vector3
  newSize: Vector3
  cursor: Vector3
}

type Axis = 'x' | 'y' | 'z'
type Alignments = '--' | '-' | '' | '+' | '++'

export type CursorDir = `${Axis}${Alignments}`

export class Cursor {
  oldSize: Vector3
  newSize: Vector3
  cursor: Vector3
  saves: Record<string, CursorSave>

  constructor() {
    this.oldSize = new Vector3(0, 0, 0)
    this.newSize = new Vector3(0, 0, 0)
    this.cursor = new Vector3(0, 0, 0)
    this.saves = {}
  }

  move(...dirs: CursorDir[]): void {
    dirs.forEach((dir) => {
      const axis = dir[0] as Axis
      const alignment = dir.slice(1) as Alignments

      if (axis === 'y') {
        switch (alignment) {
          case '++': {
            // next floor = prev ceiling
            this.cursor.y = this.cursor.y - this.oldSize.y
            break
          }

          case '+': {
            // next ceiling = prev ceiling
            this.cursor.y = this.cursor.y - (this.oldSize.y - this.newSize.y)
            break
          }

          case '': {
            // next middle = prev middle
            this.cursor.y = this.cursor.y - (this.oldSize.y / 2 - this.newSize.y / 2)
            break
          }

          case '-': {
            // next floor = prev floor
            this.cursor.y = this.cursor.y + 0
            break
          }

          case '--': {
            // next ceiling = prev floor
            this.cursor.y = this.cursor.y + this.newSize.y
            break
          }
        }
      } else {
        switch (alignment) {
          case '++': {
            this.cursor[axis] = this.cursor[axis] + (this.oldSize[axis] / 2 + this.newSize[axis] / 2)
            break
          }

          case '+': {
            this.cursor[axis] = this.cursor[axis] + (this.oldSize[axis] / 2 - this.newSize[axis] / 2)
            break
          }

          case '': {
            // nothing to do in this case
            break
          }

          case '-': {
            this.cursor[axis] = this.cursor[axis] - (this.oldSize[axis] / 2 - this.newSize[axis] / 2)
            break
          }

          case '--': {
            this.cursor[axis] = this.cursor[axis] - (this.oldSize[axis] / 2 + this.newSize[axis] / 2)
            break
          }
        }
      }
    })
  }

  saveAs(key: string): void {
    this.saves[key] = {
      cursor: this.cursor.clone(),
      oldSize: this.oldSize.clone(),
      newSize: this.newSize.clone(),
    }
  }

  restore(key: string): void {
    if (key in this.saves) {
      const { cursor, oldSize, newSize } = this.saves[key]
      this.cursor = cursor.clone()
      this.oldSize = oldSize.clone()
      this.newSize = newSize.clone()
    }
  }
}
