import { Vector3 } from '@src/Vector3.js'

export type CursorSave = {
  oldSize: Vector3
  newSize: Vector3
  cursor: Vector3
  previousIdx: number
}

export type CursorDir =
  | 'x--'
  | 'x-'
  | 'x'
  | 'x+'
  | 'x++'
  | 'y--'
  | 'y-'
  | 'y'
  | 'y+'
  | 'y++'
  | 'z--'
  | 'z-'
  | 'z'
  | 'z+'
  | 'z++'

export class Cursor {
  oldSize = new Vector3(0, 0, 0)
  newSize = new Vector3(0, 0, 0)
  cursor = new Vector3(0, 0, 0)

  saves: Record<string, CursorSave> = {}
  entries: number[] = []

  move(...dirs: CursorDir[]) {
    dirs.forEach((dir) => {
      const axis = dir[0] as 'x' | 'y' | 'z'
      const alignment = dir.slice(1) as '--' | '-' | '' | '+' | '++'

      if (axis === 'y') {
        switch (alignment) {
          case '++':
            // next floor = prev ceiling
            this.cursor.y -= this.oldSize.y
            break
          case '+':
            // next ceiling = prev ceiling
            this.cursor.y -= this.oldSize.y - this.newSize.y
            break
          case '':
            // next middle = prev middle
            this.cursor.y -= this.oldSize.y / 2 - this.newSize.y / 2
            break
          case '-':
            // next floor = prev floor
            this.cursor.y += 0
            break
          case '--':
            // next ceiling = prev floor
            this.cursor.y += this.newSize.y
            break
        }
      } else {
        switch (alignment) {
          case '++':
            this.cursor[axis] += this.oldSize[axis] / 2 + this.newSize[axis] / 2
            break
          case '+':
            this.cursor[axis] += this.oldSize[axis] / 2 - this.newSize[axis] / 2
            break
          case '-':
            this.cursor[axis] -= this.oldSize[axis] / 2 - this.newSize[axis] / 2
            break
          case '--':
            this.cursor[axis] -= this.oldSize[axis] / 2 + this.newSize[axis] / 2
            break
        }
      }
    })
  }

  saveAs(key: string) {
    const save: CursorSave = {
      cursor: this.cursor.clone(),
      oldSize: this.oldSize.clone(),
      newSize: this.newSize.clone(),
      previousIdx: this.entries.length - 1,
    }
    this.saves[key] = save
  }

  restore(key: string) {
    if (key in this.saves) {
      this.cursor = this.saves[key].cursor.clone()
      this.oldSize = this.saves[key].oldSize.clone()
      this.newSize = this.saves[key].newSize.clone()
      return this.entries[this.saves[key].previousIdx]
    }

    return undefined
  }
}
