export const clamp = (min: number, max: number, n: number) => {
  if (n < min) {
    return min
  }
  if (n > max) {
    return max
  }
  return n
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
