export const times = <T>(fn: (index: number) => T, repetitions: number): T[] => {
  return [...Array(repetitions)].map((value, index) => fn(index))
}

export const repeat = <T>(value: T, repetitions: number): T[] => {
  return Array(repetitions).fill(value)
}

export const min = (arr: number[]) => {
  let len = arr.length
  let min = Infinity

  while (len--) {
    min = arr[len] < min ? arr[len] : min
  }

  return min
}

export const max = (arr: number[]) => {
  let len = arr.length
  let max = -Infinity

  while (len--) {
    max = arr[len] > max ? arr[len] : max
  }

  return max
}

export const sum = (numbers: number[]) => {
  return numbers.reduce((sum, n) => sum + n, 0)
}

export const clone = <T>(data: T): T => {
  return JSON.parse(JSON.stringify(data))
}

export const any = <T>(fn: (value: T) => boolean, values: T[]) => {
  for (let value of values) {
    if (fn(value)) {
      return true
    }
  }
  return false
}

export const startsWith = (needle: string) => {
  return (haystack: string) => {
    return haystack.startsWith(needle)
  }
}

// https://stackoverflow.com/a/14438954/1806628
export const uniq = <T>(values: T[]) => {
  return values.filter((value, index, self) => {
    return self.indexOf(value) === index
  })
}

export const last = <T>(values: T[]) => {
  if (values.length === 0) {
    return undefined
  }

  return values[values.length - 1]
}
