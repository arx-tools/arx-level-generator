// https://stackoverflow.com/a/14438954/1806628
export const uniq = <T>(values: T[]) => {
  return values.filter((value, index, self) => {
    return self.indexOf(value) === index
  })
}

export const times = <T>(fn: (index: number) => T, repetitions: number): T[] => {
  return [...Array(repetitions)].map((value, index) => fn(index))
}

export const repeat = <T>(value: T, repetitions: number): T[] => {
  return Array(repetitions).fill(value)
}

export const identity = <T>(x: T) => {
  return x
}

export const clamp = (min: number, max: number, n: number) => {
  if (n < min) {
    return min
  }
  if (n > max) {
    return max
  }
  return n
}

export const clone = <T>(data: T): T => {
  return JSON.parse(JSON.stringify(data))
}

export const props = <T>(keys: number[] | string[], obj: Record<string, T> | T[]) => {
  if (keys.length === 0) {
    return []
  }

  if (Array.isArray(obj)) {
    return (keys as number[]).reduce((acc, key) => {
      acc.push(obj[key])
      return acc
    }, [] as T[])
  } else {
    return (keys as string[]).reduce((acc, key) => {
      acc.push(obj[key])
      return acc
    }, [] as T[])
  }
}

export const any = <T>(fn: (value: T) => boolean, values: T[]) => {
  for (let value of values) {
    if (fn(value)) {
      return true
    }
  }
  return false
}

export const without = <T>(listOfExceptions: T[], values: T[]) => {
  return values.filter((item) => {
    return !listOfExceptions.includes(item)
  })
}

export const countBy = <T>(fn: (value: T) => string, values: T[]) => {
  return values.reduce((acc, value) => {
    const key = fn(value)
    acc[key] = (acc[key] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)
}

const complement = (fn: (...args: any[]) => boolean) => {
  return (...args: any[]) => !fn(...args)
}

export const partition = <T>(fn: (arg: T) => boolean, values: T[]): [T[], T[]] => {
  return [values.filter(fn), values.filter(complement(fn))]
}

export const isEven = (n: number) => {
  return n % 2 === 0
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